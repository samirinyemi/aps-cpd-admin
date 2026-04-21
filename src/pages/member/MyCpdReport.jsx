import PageShell from '../../components/PageShell';

export default function MyCpdReport() {
  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">CPD Report</h1>
        <p className="text-sm text-gray-500 mt-0.5">Generate a PDF report of your CPD activity for the selected cycle.</p>
      </div>
      <section className="bg-white border border-gray-200 rounded-lg p-8">
        <p className="text-sm text-gray-700 mb-4">
          The CPD Report will include:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-6">
          <li>Your CPD Profile for the selected cycle (Board Registration, AoPEs, Terms of Use)</li>
          <li>The CPD Summary compliance status (Base Minimum, Peer Consultation, Active Hours, per-AoPE)</li>
          <li>The full CPD Activity History with allocations, durations, and journal entries</li>
        </ul>
        <button
          type="button"
          disabled
          title="Report generation is not implemented in this prototype"
          className="px-4 py-2 text-sm font-medium text-gray-400 border border-gray-200 rounded-md cursor-not-allowed"
        >
          Generate PDF
        </button>
        <p className="text-xs text-gray-500 mt-3">PDF generation is not implemented in this prototype.</p>
      </section>
    </PageShell>
  );
}
