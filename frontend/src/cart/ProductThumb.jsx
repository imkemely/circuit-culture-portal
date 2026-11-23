export default function ProductThumb({ line, size = 120 }) {
  const style = { width: size, height: size }
  if (line.imageUrl) {
    return <img className="cc-thumb" src={line.imageUrl} alt={line.name} style={style} />
  }
  return (
    <div className="cc-thumb cc-thumb-placeholder" style={style} role="img" aria-label={line.name}>
      IMG
    </div>
  )
}
