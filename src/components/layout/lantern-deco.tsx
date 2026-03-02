export default function LanternDeco() {
  return (
    <div className="lantern-deco">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="hanging-lantern" />
      ))}
    </div>
  )
}
