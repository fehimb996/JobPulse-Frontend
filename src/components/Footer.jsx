export default function Footer() {
  return (
    <footer
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#2c2c2c',
        borderTop: '1px solid #444',
        marginTop: '2rem',
        width: '100%', 
        position: 'relative',
        left: 0,
      }}
    >
      <p style={{ color: '#aaa' }}>&copy; 2025 Job Insights</p>
    </footer>
  );
}
