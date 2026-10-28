import { Slider as SliderPrimitive } from 'radix-ui'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'

import { cn } from '@/lib/utils'

interface SliderProps extends ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /** Accessible names for each thumb, in order. */
  thumbLabels?: string[]
}

/**
 * Figma price slider (Filters component): 4px primary track with round caps and 15px primary
 * thumbs outlined by a 3px ink ring.
 */
const Slider = forwardRef<ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, thumbLabels = [], value, defaultValue, ...props }, ref) => {
    const thumbs = (value ?? defaultValue ?? [0]).length
    return (
      <SliderPrimitive.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        className={cn(
          'relative flex h-[21px] w-full touch-none items-center select-none data-[disabled]:opacity-50',
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-primary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbs }).map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            aria-label={thumbLabels[index]}
            className="block size-[21px] cursor-grab rounded-full border-[3px] border-background bg-primary outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:cursor-grabbing"
          />
        ))}
      </SliderPrimitive.Root>
    )
  },
)
Slider.displayName = 'Slider'

export { Slider }
