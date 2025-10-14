# Basic CRUD Example

This example demonstrates how to build a complete CRUD interface for a blog post management system.

## Goal

Create an admin panel to manage blog posts with:
- List view with search and filtering
- Create form with validation
- Edit functionality
- Delete with confirmation
- Category relationship
- Published status toggle

## Setup

First, install Filact:

```bash
pnpm add @filact/core @filact/ui
```

## Define the Resource

Create `src/resources/post.ts`:

```typescript
import { defineResource, z } from '@filact/core'
import {
  TextInput,
  TextArea,
  Select,
  Switch,
  RelationshipSelect,
  TextColumn,
  BadgeColumn,
  DateColumn,
  BooleanColumn,
} from '@filact/core'

export const postResource = defineResource({
  name: 'Post',
  endpoint: '/api/posts',

  schema: z.object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    content: z.string(),
    excerpt: z.string().optional(),
    categoryId: z.number(),
    category: z.object({
      id: z.number(),
      name: z.string(),
    }).optional(),
    published: z.boolean(),
    publishedAt: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),

  form: {
    fields: [
      TextInput.make('title')
        .label('Title')
        .required()
        .maxLength(255)
        .placeholder('Enter post title'),

      TextInput.make('slug')
        .label('URL Slug')
        .required()
        .helperText('Used in the post URL')
        .placeholder('my-blog-post'),

      TextArea.make('excerpt')
        .label('Excerpt')
        .maxLength(500)
        .rows(3)
        .placeholder('Brief description of the post'),

      TextArea.make('content')
        .label('Content')
        .required()
        .rows(10)
        .placeholder('Write your post content here...'),

      RelationshipSelect.make('categoryId')
        .label('Category')
        .resource('Category')
        .required()
        .searchable()
        .createable(),

      Switch.make('published')
        .label('Published')
        .helperText('Make this post visible to readers'),
    ],
  },

  columns: [
    TextColumn.make('title')
      .label('Title')
      .searchable()
      .sortable(),

    TextColumn.make('category.name')
      .label('Category'),

    BadgeColumn.make('published')
      .label('Status')
      .formatAs((value) => value ? 'Published' : 'Draft')
      .colors({
        true: 'green',
        false: 'gray',
      }),

    DateColumn.make('publishedAt')
      .label('Published')
      .format('MMM DD, YYYY')
      .sortable(),

    DateColumn.make('createdAt')
      .label('Created')
      .format('MMM DD, YYYY')
      .sortable(),
  ],

  filters: [
    SelectFilter.make('categoryId')
      .label('Category')
      .resource('Category'),

    BooleanFilter.make('published')
      .label('Status')
      .options([
        { value: true, label: 'Published' },
        { value: false, label: 'Draft' },
      ]),
  ],

  actions: [
    Action.make('publish')
      .label('Publish')
      .icon(<CheckIcon />)
      .visible((record) => !record.published)
      .requiresConfirmation()
      .onClick(async (record) => {
        await publishPost(record.id)
      }),

    Action.make('unpublish')
      .label('Unpublish')
      .icon(<XIcon />)
      .visible((record) => record.published)
      .onClick(async (record) => {
        await unpublishPost(record.id)
      }),
  ],

  bulkActions: [
    BulkAction.make('publish')
      .label('Publish Selected')
      .icon(<CheckIcon />)
      .onClick(async (records) => {
        await publishPosts(records.map(r => r.id))
      }),

    BulkAction.make('delete')
      .label('Delete Selected')
      .icon(<TrashIcon />)
      .variant('destructive')
      .requiresConfirmation()
      .confirmationText('Are you sure you want to delete these posts?')
      .onClick(async (records) => {
        await deletePosts(records.map(r => r.id))
      }),
  ],
})
```

## Define the Category Resource

Create `src/resources/category.ts`:

```typescript
import { defineResource, z } from '@filact/core'
import { TextInput, TextColumn } from '@filact/core'

export const categoryResource = defineResource({
  name: 'Category',
  endpoint: '/api/categories',

  schema: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
  }),

  form: {
    fields: [
      TextInput.make('name')
        .label('Name')
        .required()
        .maxLength(100),

      TextInput.make('slug')
        .label('Slug')
        .required()
        .maxLength(100),

      TextArea.make('description')
        .label('Description')
        .rows(3),
    ],
  },

  columns: [
    TextColumn.make('name')
      .label('Name')
      .searchable()
      .sortable(),

    TextColumn.make('slug')
      .label('Slug'),

    TextColumn.make('description')
      .label('Description'),
  ],
})
```

## Set Up the Panel

Create `src/App.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Panel, RestDataProvider } from '@filact/core'
import { postResource } from './resources/post'
import { categoryResource } from './resources/category'

const queryClient = new QueryClient()

const dataProvider = RestDataProvider({
  baseURL: 'https://api.example.com',
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Panel
        id="blog-admin"
        name="Blog Admin"
        resources={[postResource, categoryResource]}
        dataProvider={dataProvider}
      />
    </QueryClientProvider>
  )
}

export default App
```

## API Implementation

Here's a simple API implementation using Express:

```typescript
// server/routes/posts.ts
import express from 'express'
import { db } from '../db'

const router = express.Router()

// Get all posts
router.get('/posts', async (req, res) => {
  const { page = 1, perPage = 10, search, categoryId, published } = req.query

  let query = db.select().from('posts')

  // Apply filters
  if (search) {
    query = query.where('title', 'like', `%${search}%`)
  }
  if (categoryId) {
    query = query.where('categoryId', categoryId)
  }
  if (published !== undefined) {
    query = query.where('published', published === 'true')
  }

  // Pagination
  const offset = (Number(page) - 1) * Number(perPage)
  const posts = await query.limit(Number(perPage)).offset(offset)
  const total = await db.select().from('posts').count()

  res.json({
    data: posts,
    meta: {
      total,
      page: Number(page),
      perPage: Number(perPage),
    },
  })
})

// Get single post
router.get('/posts/:id', async (req, res) => {
  const post = await db.select().from('posts').where('id', req.params.id).first()
  res.json(post)
})

// Create post
router.post('/posts', async (req, res) => {
  const post = await db.insert('posts').values(req.body)
  res.json(post)
})

// Update post
router.put('/posts/:id', async (req, res) => {
  const post = await db.update('posts').where('id', req.params.id).values(req.body)
  res.json(post)
})

// Delete post
router.delete('/posts/:id', async (req, res) => {
  await db.delete('posts').where('id', req.params.id)
  res.json({ success: true })
})

export default router
```

## Result

You now have a complete blog management system with:

✅ **List Page**
- Searchable by title
- Filterable by category and status
- Sortable columns
- Bulk actions (publish, delete)

✅ **Create Page**
- Form validation
- Relationship to categories
- Published toggle

✅ **Edit Page**
- Pre-populated form
- Update functionality

✅ **Delete Functionality**
- Confirmation dialog
- Bulk delete support

✅ **Actions**
- Publish/unpublish posts
- Contextual visibility

✅ **Responsive Design**
- Mobile-friendly layout
- Touch-optimized interactions

## Using the CLI

You can generate this entire setup with the CLI:

```bash
# Generate Post resource
filact generate:resource Post -f "title:string,slug:string,content:text,excerpt:text,categoryId:number,published:boolean"

# Generate Category resource
filact generate:resource Category -f "name:string,slug:string,description:text"
```

Then customize the generated code as needed!

## Next Steps

- [Advanced Forms](/examples/advanced-forms) - Multi-step forms, repeaters, and more
- [Custom Actions](/examples/custom-actions) - Create custom action types
- [Dashboard Widgets](/examples/dashboard) - Add stats and charts
