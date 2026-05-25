export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b1020',
      color: 'white',
      padding: '40px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        POP FIRM
      </h1>

      <p style={{ fontSize: '20px', marginBottom: '40px' }}>
        Site online com sucesso.
      </p>

      <div style={{
        background: '#111827',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px'
      }}>
        <h2>$25K Challenge</h2>
        <p>Preço: $149</p>
      </div>

      <div style={{
        background: '#111827',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h2>$100K Challenge</h2>
        <p>Preço: $399</p>
      </div>
    </div>
  );
}
