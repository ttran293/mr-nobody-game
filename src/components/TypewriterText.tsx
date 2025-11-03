// src/components/TypewriterText.tsx
"use client";
import Typewriter from "typewriter-effect";

export default function TypewriterText({ text }: { text: string }) {
  return (
    <div className="text-2xl font-open-sans">
      <Typewriter
        options={{
          autoStart: true,
          loop: false,
        }}
        onInit={(typewriter) => {
          typewriter.changeDelay(25).typeString(text).start();
        }}
      />
    </div>
  );
}
