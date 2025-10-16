import Image from "next/image";
import { Button } from "@/components/ui/pixelact-ui/button";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/pixelact-ui/alert";
import { AgeIndicator } from "@/components/age-indicator";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
       <main className="flex flex-col gap-[32px] row-start-2 items-center max-w-2xl mx-auto px-4">
        <Progress value={16} />
        <AgeIndicator age={16} />
        <div className="flex flex-col gap-[16px]"></div>
        <Alert>
          <AlertTitle>You’re sixteen</AlertTitle>
          <AlertDescription>
            Rain taps the bus window. Your band has its first gig tonight but
            finals start tomorrow. Study will help you pass and make your
            parents proud, but you'll miss your first gig. Playing the gig will
            give you a chance to show your skills and impress your friends, but
            you might fail and disappoint your parents.
            <br />
            What do you do?
          </AlertDescription>
        </Alert>
        <RadioGroup defaultValue="option-one">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-one" id="option-one" />
            <Label htmlFor="option-one">Study all night</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-two" id="option-two" />
            <Label htmlFor="option-two">Play the gig anyway </Label>
          </div>
        </RadioGroup>

        <Button variant="default">Continue</Button>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
