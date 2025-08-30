import React from 'react'

function CatalogSearch({BRAND,search,setLookupError, setSearch,matches,addFromMatch, lookupError}) {
  return (
    <div className="mb-4">
    <div className="relative">
      <input
        placeholder="Search catalog by name or location…"
        className="w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-2"
        style={{
          borderColor: `${BRAND.primary}33`,
          focusRingColor: BRAND.primary,
        }}
        value={search}
        onChange={(e) => {
          setLookupError('');
          setSearch(e.target.value);
        }}
      />
      {search.trim() && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-auto"
             style={{ borderColor: `${BRAND.primary}33` }}>
          {matches.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No matches</div>
          ) : (
            matches.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => addFromMatch(m)}
                className="w-full text-left px-3 py-2 hover:bg-opacity-60"
                style={{ color: BRAND.primary, background: `${BRAND.tint}` }}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{m.product_name}</span>
                  <span className="text-sm opacity-80">{m.location}</span>
                </div>
                <div className="text-xs opacity-70">Price: {m.sale_price}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
    {lookupError && (
      <p className="text-sm mt-1" style={{ color: '#dc2626' }}>
        {lookupError}
      </p>
    )}
  </div>
  )
}

export {CatalogSearch}