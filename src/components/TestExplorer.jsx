import { useState } from 'react';

export function TestExplorer() {
  const [selectedRoute, setSelectedRoute] = useState('MSCGULSUN');

  return (
    <div style={{
      width: '360px',
      height: '100vh',
      backgroundColor: '#1a1f2e',
      padding: '24px',
      color: '#ffffff'
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#f1f5f9',
        marginBottom: '24px'
      }}>
        Test Explorer Mode
      </div>
      
      <div style={{
        backgroundColor: selectedRoute === 'MSCGULSUN' ? '#3b82f6' : 'transparent',
        border: `2px solid ${selectedRoute === 'MSCGULSUN' ? '#3b82f6' : '#64748b'}`,
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        marginBottom: '8px'
      }}>
        Test Route Card
      </div>
      
      <div style={{
        backgroundColor: selectedRoute === 'MSCGULSUN' ? '#3b82f6' : 'transparent',
        border: `2px solid ${selectedRoute === 'MSCGULSUN' ? '#3b82f6' : '#64748b'}`,
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        marginBottom: '8px'
      }}>
        Test Route Card 2
      </div>
    </div>
  );
}
