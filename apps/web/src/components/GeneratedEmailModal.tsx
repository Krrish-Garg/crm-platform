interface GeneratedEmailModalProps {
  email: string | null
  isLoading: boolean
  error: string
  onClose: () => void
}

function GeneratedEmailModal({ email, isLoading, error, onClose }: GeneratedEmailModalProps) {
  function handleCopy() {
    if (email) {
      navigator.clipboard.writeText(email)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI-Generated Follow-Up Email</h2>

        {isLoading && (
          <p className="text-gray-600 py-8 text-center">Generating email...</p>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>
        )}

        {email && !isLoading && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md text-sm text-gray-800 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {email}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          {email && !isLoading && (
            <button
              onClick={handleCopy}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Copy
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default GeneratedEmailModal