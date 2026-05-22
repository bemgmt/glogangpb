// Kiosk route group — standalone layout, no navbar/footer
// Safe area padding for iPad kiosk mode
export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      paddingTop: 'env(safe-area-inset-top)',
      paddingRight: 'env(safe-area-inset-right)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
    }}>
      {children}
    </div>
  )
}
