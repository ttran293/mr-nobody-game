import { Badge } from "@/components/ui/badge"

interface AgeIndicatorProps {
  age: number
}

export function AgeIndicator({ age }: AgeIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="relative">
        <Badge 
          variant="outline" 
          className="text-xs font-bold py-3 border-0"
        >
          AGE: {age}
        </Badge>
      </div>
    </div>
  )
}
