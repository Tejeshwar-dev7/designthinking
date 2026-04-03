'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteStudentProfile } from '@/app/admin/actions';

export function DeleteStudentButton({ profileId, studentName }: { profileId: string; studentName: string }) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteStudentProfile(profileId);
      if (result.error) {
        setError(result.error);
      } else {
        setShowModal(false);
        router.refresh(); // Reload the admin page roster
      }
    });
  }

  return (
    <>
      <button
        onClick={() => { setError(null); setShowModal(true); }}
        className="inline-flex items-center justify-center px-3 py-2 border border-red-200 text-sm font-semibold rounded-lg text-red-600 hover:bg-red-50 transition-colors shadow-sm"
      >
        Delete
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isPending && setShowModal(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-md w-full text-center z-10">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Student Profile?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-2">
              You are about to permanently delete the profile for:
            </p>
            <p className="text-indigo-700 font-bold text-lg mb-4">"{studentName}"</p>
            <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-6">
              ⚠️ This will also delete their face biometrics and all attendance records. This action cannot be undone.
            </p>

            {error && (
              <p className="text-red-600 text-sm mb-4 font-medium bg-red-50 rounded-lg px-4 py-2">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
