import { redirect } from "next/navigation";

// The only entry points are the admin area and the public QR pages.
export default function HomePage() {
  redirect("/admin/equipamentos");
}
