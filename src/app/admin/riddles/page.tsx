import { getRiddles } from '@/actions/riddles'
import RiddleForm from '@/components/admin/riddle-form'
import RiddleTable from './riddle-table'

export default async function RiddlesPage() {
  const riddles = await getRiddles()

  return (
    <>
      <h1 className="admin-page-title">灯谜管理</h1>
      <RiddleForm />

      <div className="panel">
        <div className="panel-title">灯谜列表 ({riddles.length})</div>
        <RiddleTable riddles={riddles} />
      </div>
    </>
  )
}
