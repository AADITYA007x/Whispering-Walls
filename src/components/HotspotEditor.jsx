import { useState } from 'react'

const emptyForm = { title: '', story: '' }

export default function HotspotEditor({ hotspots, draft, editingId, onEdit, onSave, onDelete, onCancel, status }) {
  const editing = hotspots.find((h) => h.id === editingId)
  const [form, setForm] = useState(editing ? { title: editing.title, story: editing.story } : emptyForm)
  const [error, setError] = useState('')
  const formOpen = Boolean(draft)

  function submit(event) {
    event.preventDefault()
    if (!form.title.trim()) return setError('Give this detail a title.')
    if (!form.story.trim()) return setError('Write a short story for this detail.')
    setError('')
    onSave({ title: form.title.trim(), story: form.story.trim() })
    setForm(emptyForm)
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setError('')
  }

  return (
    <section className="border border-gilt/60 p-5">
      <h2 className="font-display text-xl">Hotspot editor</h2>
      <p className="mt-1 text-sm opacity-75">
        Only visible while running locally. {formOpen ? 'Click the painting to move the marker.' : 'Click the painting to place a new hotspot.'}
      </p>

      {formOpen && (
        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block text-sm">
            Title
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="The hidden signature"
              className="mt-1 block w-full border border-ivory/30 bg-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Story
            <textarea
              value={form.story}
              onChange={(e) => update('story', e.target.value)}
              rows={5}
              placeholder="Two or three sentences about this detail."
              className="mt-1 block w-full border border-ivory/30 bg-black/20 px-3 py-2"
            />
          </label>
          {error && <p className="text-sm text-gilt">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="bg-gilt px-4 py-2 text-sm text-ink">
              {editing ? 'Save changes' : 'Add hotspot'}
            </button>
            <button type="button" onClick={onCancel} className="border border-current px-4 py-2 text-sm">
              Cancel
            </button>
            {editing && (
              <button type="button" onClick={() => onDelete(editing.id)} className="ml-auto px-4 py-2 text-sm underline">
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {hotspots.length > 0 && (
        <ol className="mt-6 space-y-1 text-sm">
          {hotspots.map((h, i) => (
            <li key={h.id} className="flex items-center justify-between gap-3 border-t border-ivory/15 py-2">
              <span>
                {i + 1}. {h.title}
              </span>
              <button
                type="button"
                onClick={() => {
                  setForm({ title: h.title, story: h.story })
                  onEdit(h.id)
                }}
                className="underline"
              >
                Edit
              </button>
            </li>
          ))}
        </ol>
      )}

      {status && <p className="mt-4 text-sm opacity-80">{status}</p>}
    </section>
  )
}
