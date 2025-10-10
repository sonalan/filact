# Slider Field Component

## Overview

This PR implements a complete **Slider field builder** for the form system, allowing developers to create slider inputs for numeric values with customizable ranges, steps, marks, and display options.

## Features Implemented

### Core Functionality
- **Range Configuration**: Set min, max, and step values
- **Value Display**: Optional value display next to slider
- **Marks Support**: Add labeled or unlabeled marks along the slider
- **Prefix/Suffix**: Display units or symbols before/after the value
- **Default Value**: Set initial slider position

### Builder Pattern
Follows the existing form field builder pattern with fluent API:
- Chainable methods for configuration
- Type-safe configuration
- Validation support via Zod schemas
- Conditional states (visible, disabled, readonly)

### TypeScript Support
- `SliderFieldConfig` interface
- Generic support for typed data
- Full IntelliSense support

## API Reference

### `Slider.make(name: string)`

Factory method to create a new slider field builder.

### SliderBuilder Methods

**Range Configuration:**
- `.min(value: number)` - Set minimum value (default: 0)
- `.max(value: number)` - Set maximum value (default: 100)
- `.step(value: number)` - Set step increment (default: 1)

**Display Options:**
- `.showValue(show?: boolean)` - Show current value (default: true)
- `.showMarks(show?: boolean)` - Show marks on slider (default: true)
- `.marks(marks: Array<{ value: number; label?: string }>)` - Set custom marks
- `.prefix(prefix: ReactNode)` - Set prefix (e.g., "$", "€")
- `.suffix(suffix: ReactNode)` - Set suffix (e.g., "%", "°C", "km")

**Common Field Options:**
- `.label(text: string)` - Field label
- `.helperText(text: string)` - Helper text below field
- `.required(required?: boolean)` - Mark as required
- `.disabled(disabled: boolean | Function)` - Disable field
- `.readonly(readonly: boolean | Function)` - Make readonly
- `.visible(visible: boolean | Function)` - Conditional visibility
- `.default(value: number)` - Default value
- `.columnSpan(span: number)` - Grid column span
- `.validate(schema: ZodType)` - Validation schema

## Usage Examples

### Basic Slider (0-100)

```typescript
import { Slider } from '@filact/core'

const volumeField = Slider.make('volume')
  .label('Volume')
  .showValue()
  .build()

// Result:
// - Range: 0-100
// - Step: 1
// - Shows current value
```

### Percentage Slider

```typescript
const completionField = Slider.make('completion')
  .label('Completion')
  .min(0)
  .max(100)
  .step(1)
  .suffix('%')
  .showValue()
  .default(0)
  .build()
```

### Temperature Slider with Marks

```typescript
const tempField = Slider.make('temperature')
  .label('Temperature')
  .min(-20)
  .max(40)
  .step(0.5)
  .suffix('°C')
  .showValue()
  .showMarks()
  .marks([
    { value: -20, label: 'Cold' },
    { value: 0, label: 'Zero' },
    { value: 20, label: 'Room' },
    { value: 40, label: 'Hot' },
  ])
  .build()
```

### Price Range Slider

```typescript
const priceField = Slider.make('maxPrice')
  .label('Max Price')
  .min(0)
  .max(1000)
  .step(10)
  .prefix('$')
  .showValue()
  .default(500)
  .helperText('Set your maximum budget')
  .build()
```

### Brightness Slider with All Options

```typescript
const brightnessField = Slider.make('brightness')
  .label('Brightness')
  .min(0)
  .max(100)
  .step(5)
  .showValue()
  .showMarks()
  .marks([
    { value: 0, label: 'Off' },
    { value: 50, label: 'Medium' },
    { value: 100, label: 'Full' },
  ])
  .prefix('💡 ')
  .default(75)
  .helperText('Adjust screen brightness')
  .required()
  .build()
```

### Conditional Slider

```typescript
const advancedSlider = Slider.make('quality')
  .label('Quality')
  .min(1)
  .max(10)
  .visible((values) => values.showAdvanced === true)
  .disabled((values) => values.isProcessing === true)
  .build()
```

### With Validation

```typescript
import { z } from 'zod'

const ratingField = Slider.make('rating')
  .label('Rating')
  .min(1)
  .max(5)
  .step(0.5)
  .suffix(' stars')
  .validate(z.number().min(1).max(5))
  .required()
  .build()
```

## Common Use Cases

### 1. Volume Control
```typescript
Slider.make('volume')
  .label('Volume')
  .min(0)
  .max(100)
  .suffix('%')
  .showValue()
```

### 2. Age Range
```typescript
Slider.make('age')
  .label('Age')
  .min(18)
  .max(100)
  .suffix(' years')
  .default(25)
```

### 3. Rating System
```typescript
Slider.make('rating')
  .label('Rating')
  .min(0)
  .max(5)
  .step(0.5)
  .suffix(' ⭐')
  .showMarks()
  .marks([
    { value: 0 },
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
  ])
```

### 4. Opacity Control
```typescript
Slider.make('opacity')
  .label('Opacity')
  .min(0)
  .max(1)
  .step(0.1)
  .default(1)
  .suffix(' (transparent to opaque)')
```

### 5. Zoom Level
```typescript
Slider.make('zoom')
  .label('Zoom')
  .min(50)
  .max(200)
  .step(10)
  .suffix('%')
  .default(100)
  .marks([
    { value: 50, label: '50%' },
    { value: 100, label: '100%' },
    { value: 200, label: '200%' },
  ])
```

## Test Coverage

**34 comprehensive tests** covering:

### Basic Configuration (6 tests)
- ✅ Create basic slider field
- ✅ Set label
- ✅ Set min value
- ✅ Set max value
- ✅ Set step value
- ✅ Set range (min, max, step together)

### Display Options (10 tests)
- ✅ Show value (default and explicit)
- ✅ Hide value
- ✅ Show marks
- ✅ Set custom marks with labels
- ✅ Set marks without labels
- ✅ Set prefix
- ✅ Set suffix
- ✅ Set both prefix and suffix

### Field States (8 tests)
- ✅ Set required
- ✅ Set disabled (boolean and function)
- ✅ Set readonly (boolean and function)
- ✅ Set visible (boolean and function)

### Additional Configuration (4 tests)
- ✅ Set helper text
- ✅ Set default value
- ✅ Set column span
- ✅ Set validation schema

### Chaining & Use Cases (5 tests)
- ✅ Method chaining
- ✅ Percentage slider
- ✅ Temperature slider
- ✅ Price range slider
- ✅ Brightness slider with all options

### Error Handling (1 test)
- ✅ Throw error when name is missing

## Technical Implementation

### Type Definitions

```typescript
export interface SliderFieldConfig extends BaseFieldConfig {
  type: 'slider'
  min?: number
  max?: number
  step?: number
  showValue?: boolean
  showMarks?: boolean
  marks?: Array<{ value: number; label?: string }>
  prefix?: ReactNode
  suffix?: ReactNode
}
```

### Builder Class

```typescript
export class SliderBuilder {
  private config: Partial<SliderFieldConfig> = {
    type: 'slider',
    name: '',
    min: 0,
    max: 100,
    step: 1,
  }

  // ... builder methods ...

  build(): SliderFieldConfig {
    if (!this.config.name) {
      throw new Error('Field name is required')
    }
    return this.config as SliderFieldConfig
  }
}
```

### Factory Export

```typescript
export const Slider = {
  make: (name: string) => new SliderBuilder(name),
}
```

## Integration

The slider field integrates seamlessly with the existing form system:

```typescript
import { FormBuilder, Slider } from '@filact/core'

const form = FormBuilder.make('settings')
  .fields([
    Slider.make('volume')
      .label('Volume')
      .showValue()
      .suffix('%'),

    Slider.make('brightness')
      .label('Brightness')
      .min(0)
      .max(100)
      .default(75),
  ])
  .build()
```

## Files Changed

- `packages/core/src/types/form.ts` - Added `SliderFieldConfig` interface
- `packages/core/src/forms/fields.tsx` - Added `SliderBuilder` class and `Slider` factory
- `packages/core/src/forms/SliderField.test.ts` - Test suite (34 tests)

## Breaking Changes

None - This is a new feature addition. The `Field` union type is extended to include `SliderFieldConfig`.

## Future Enhancements

Potential improvements:
- Range slider (dual handles for min/max)
- Vertical orientation
- Logarithmic scale
- Custom tick rendering
- Keyboard navigation enhancements
- Accessibility improvements (ARIA labels)
- Touch gesture support
