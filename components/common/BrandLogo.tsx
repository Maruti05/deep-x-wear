import Logo from "@/public/logo-d.svg";
import Image from "next/image";
const APP_NAME = "Deep-Xwear";
export function BrandLogo() {
  return <Image
  src={Logo}
  alt={APP_NAME}
  width={0}
  height={0}
  className="h-10 w-auto invert-0 dark:invert"
/>;
}
