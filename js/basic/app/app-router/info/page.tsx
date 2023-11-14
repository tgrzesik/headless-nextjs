'use client'

import action from "@/app/actions"

 
 
export default function ClientComponent() {
  return (
    <form action={action}>
      <button type="submit">Revalidate Component</button>
    </form>
  )
}
