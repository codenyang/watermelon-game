import styles from './page.module.scss'
import Suika from "@/components/suika";

export default function Home() {
  return (
    <main className={styles.main}>
      <div>
        <Suika />
      </div>
    </main>
  )
}
