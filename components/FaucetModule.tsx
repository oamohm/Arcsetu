export default function FaucetModule() {
  return (
    <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E40AF', marginBottom: '4px' }}>
        💧 GIWA Testnet Faucets
      </div>
      <div style={{ fontSize: '11px', color: '#3B82F6', marginBottom: '10px' }}>
        Claim 10 TEST gas tokens from official Lambda256 faucet:
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <a 
          href="https://faucet.lambda256.io/giwa-sepolia" 
          target="_blank" 
          rel="noreferrer"
          style={{ padding: '6px 12px', backgroundColor: '#1D4ED8', color: '#FFFFFF', borderRadius: '8px', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}
        >
          Primary Faucet (10 TEST)
        </a>
        <a 
          href="https://faucet.trade/giwa-sepolia-eth-faucet" 
          target="_blank" 
          rel="noreferrer"
          style={{ padding: '6px 12px', backgroundColor: '#FFFFFF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}
        >
          Backup Faucet
        </a>
      </div>
    </div>
  );
}
