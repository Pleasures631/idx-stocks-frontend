import Image from "next/image"

export function BrandMark({ className = "" }: { className?: string }) {
  return <>
    <Image src="/img/yapping-saham-logo/logo.svg" alt="Yapping Saham" width={240} height={60} priority className={`dark:hidden ${className}`} />
    <Image src="/img/yapping-saham-logo/logo-dark.svg" alt="Yapping Saham" width={240} height={60} priority className={`hidden dark:block ${className}`} />
  </>
}
