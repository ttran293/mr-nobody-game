import { Button } from "./button";
import { House } from "lucide-react";
import Link from "next/link";

export function MenuButton() {
    return (
      <Link href="/">
        <Button
          variant="outline"
          className="cursor-pointer"
        >
          <House size={24} />
        </Button>
      </Link>
    );
}