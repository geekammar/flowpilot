import { Button } from "@/components/ui/button";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-lg font-semibold">الصفحة غير موجودة</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Button asChild variant="outline">
        <Link href="/">العودة إلى الرئيسية</Link>
      </Button>
    </div>
  );
}
