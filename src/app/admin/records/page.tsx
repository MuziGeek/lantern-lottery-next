import { getRecords } from '@/actions/records'
import RecordsView from './records-view'

export default async function RecordsPage() {
  const records = await getRecords()

  return (
    <>
      <h1 className="admin-page-title">中奖记录</h1>
      <RecordsView initialRecords={records} />
    </>
  )
}
