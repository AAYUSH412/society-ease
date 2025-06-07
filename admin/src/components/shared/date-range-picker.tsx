"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react"

interface DateRange {
  from?: Date
  to?: Date
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const quickRanges = [
    {
      label: "Today",
      range: { from: new Date(), to: new Date() }
    },
    {
      label: "Last 7 days",
      range: { from: subDays(new Date(), 6), to: new Date() }
    },
    {
      label: "Last 30 days",
      range: { from: subDays(new Date(), 29), to: new Date() }
    },
    {
      label: "This month",
      range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }
    },
    {
      label: "Last month",
      range: { 
        from: startOfMonth(subDays(startOfMonth(new Date()), 1)), 
        to: endOfMonth(subDays(startOfMonth(new Date()), 1)) 
      }
    },
    {
      label: "This year",
      range: { from: startOfYear(new Date()), to: endOfYear(new Date()) }
    }
  ]

  const formatDateRange = (range?: DateRange) => {
    if (!range?.from) return placeholder
    
    if (!range.to) {
      return format(range.from, "MMM dd, yyyy")
    }
    
    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, "MMM dd, yyyy")
    }
    
    return `${format(range.from, "MMM dd, yyyy")} - ${format(range.to, "MMM dd, yyyy")}`
  }

  const handleQuickRange = (range: DateRange) => {
    onChange?.(range)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  const getDaysSelected = () => {
    if (!value?.from || !value?.to) return 0
    const diffTime = Math.abs(value.to.getTime() - value.from.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value?.from && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="flex-1 truncate">
            {formatDateRange(value)}
          </span>
          
          {value?.from && (
            <div className="flex items-center gap-1 ml-2">
              <Badge variant="secondary" className="text-xs">
                {getDaysSelected()} day{getDaysSelected() !== 1 ? 's' : ''}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Quick ranges */}
          <div className="border-r bg-muted/30 p-3 space-y-1 min-w-[140px]">
            <p className="text-sm font-medium mb-2">Quick ranges</p>
            {quickRanges.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-1.5 px-2"
                onClick={() => handleQuickRange(item.range)}
              >
                {item.label}
              </Button>
            ))}
            
            <hr className="my-2" />
            
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-auto py-1.5 px-2 text-muted-foreground"
              onClick={() => onChange?.(undefined)}
            >
              Clear selection
            </Button>
          </div>
          
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
              disabled={disabled}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
