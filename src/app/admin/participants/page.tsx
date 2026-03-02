import { getParticipants } from '@/actions/participants'
import ParticipantForm from '@/components/admin/participant-form'
import CsvImport from '@/components/admin/csv-import'
import ParticipantTable from './participant-table'

export default async function ParticipantsPage() {
  const participants = await getParticipants()

  return (
    <>
      <h1 className="admin-page-title">人员管理</h1>
      <ParticipantForm />
      <CsvImport />
      <div className="panel">
        <div className="panel-title">参与者列表 ({participants.length})</div>
        <ParticipantTable participants={participants} />
      </div>
    </>
  )
}
