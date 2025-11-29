// src/components/TypewriterText.tsx
"use client";
import Typewriter from "typewriter-effect";

export default function TypewriterText({ text }: { text: string }) {
  return (
    <div className="text-lg font-lexend">
      <Typewriter
        options={{
          autoStart: true,
          loop: false,
        }}
        onInit={(typewriter) => {
          typewriter.changeDelay(30).typeString(text).start();
        }}
      />
    </div>
  );
}
