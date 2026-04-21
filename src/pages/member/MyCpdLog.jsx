import { Navigate } from 'react-router-dom';

// The dedicated log page has been replaced by an overlay on the Activities
// page. Any link still pointing here redirects with ?log=1 so the Activities
// page auto-opens the log modal in context.
export default function MyCpdLog() {
  return <Navigate to="/member/cpd/activities?log=1" replace />;
}
