import React, { useEffect, useMemo, useState } from 'react';
import { Languages, Filter, Plus, Search } from 'lucide-react';
import { fetchCountries, fetchAdminSettings, updateAdminSettings } from '../service/api';
import type { AdminSettings } from '../service/api';

interface LanguagesManagementProps {}

type CountryRecord = {
  id: string;
  name?: string;
  country_name?: string;
  code?: string;
  languages?: string[];
};

type AggregatedLanguage = {
  code: string;
  label: string;
  countriesCount: number;
  countryNames: string[];
};

const LanguagesManagement: React.FC<LanguagesManagementProps> = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [query, setQuery] = useState('');
  const [defaultLang, setDefaultLang] = useState<string>('');
  const [savingDefault, setSavingDefault] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [editableLanguages, setEditableLanguages] = useState<Array<{ code: string; label?: string; nativeName?: string; flag?: string; enabled?: boolean }>>([]);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [list, settings] = await Promise.all([
          fetchCountries(),
          (async () => {
            try { return await fetchAdminSettings(); } catch { return null as unknown as AdminSettings; }
          })()
        ]);
        if (!mounted) return;
        setCountries(Array.isArray(list) ? list : []);
        if (settings && (settings as any)?.platform?.defaultLanguage) {
          setDefaultLang((settings as any).platform.defaultLanguage);
        }
        if (settings && (settings as any)?.platform?.supportedLanguages) {
          setEditableLanguages([...(settings as any).platform.supportedLanguages]);
        } else {
          // Fallback seed from aggregated list
          setEditableLanguages(
            Array.from(new Set((Array.isArray(list) ? list : []).flatMap((c: any) => (c?.languages || []) as string[])))
              .slice(0, 50) // avoid huge initial payload
              .map((code: string) => ({ code, label: code.toUpperCase(), enabled: true }))
          );
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load countries');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const languages: AggregatedLanguage[] = useMemo(() => {
    const map = new Map<string, { count: number; countries: string[] }>();
    for (const c of countries) {
      const countryName = c?.name || c?.country_name || c?.code || c?.id;
      const langs = Array.isArray(c.languages) ? c.languages : [];
      for (const code of langs) {
        const key = String(code).trim();
        if (!key) continue;
        const entry = map.get(key) || { count: 0, countries: [] };
        entry.count += 1;
        if (countryName && !entry.countries.includes(countryName)) entry.countries.push(countryName);
        map.set(key, entry);
      }
    }
    const result: AggregatedLanguage[] = Array.from(map.entries()).map(([code, info]) => ({
      code,
      label: code.toUpperCase(),
      countriesCount: info.count,
      countryNames: info.countries.sort().slice(0, 6),
    }));
    result.sort((a, b) => b.countriesCount - a.countriesCount || a.code.localeCompare(b.code));
    return result;
  }, [countries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(l =>
      l.code.toLowerCase().includes(q) ||
      l.label.toLowerCase().includes(q) ||
      l.countryNames.some(n => n.toLowerCase().includes(q))
    );
  }, [languages, query]);

  return (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-900">Languages</h3>
      <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code or country"
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-my-primary focus:border-transparent text-sm"
            />
          </div>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
        <button className="bg-my-primary hover:bg-my-primary/80 text-white px-6 py-2 rounded-xl transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Language
        </button>
      </div>
    </div>

      {/* Default Language Selector */}
      <div className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm text-gray-600">Default Platform Language</div>
            <div className="text-gray-900 font-semibold">{defaultLang ? defaultLang.toUpperCase() : 'Not set'}</div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={defaultLang}
              onChange={(e) => setDefaultLang(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-my-primary focus:border-transparent text-sm"
            >
              <option value="">Select language</option>
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>
              ))}
            </select>
            <button
              onClick={async () => {
                setSavingDefault(true);
                setSaveMsg(null);
                try {
                  await updateAdminSettings({ platform: { defaultLanguage: defaultLang } } as Partial<AdminSettings>);
                  setSaveMsg('Default language saved');
                } catch (e: any) {
                  setSaveMsg(e?.message || 'Failed to save default language');
                } finally {
                  setSavingDefault(false);
                  setTimeout(() => setSaveMsg(null), 3000);
                }
              }}
              disabled={!defaultLang || savingDefault}
              className="px-4 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90 disabled:opacity-50 text-sm"
            >
              {savingDefault ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
        {saveMsg && (
          <div className="mt-2 text-sm text-gray-700">{saveMsg}</div>
        )}
      </div>

      {/* Editable Supported Languages */}
      <div className="mb-6 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-600">Supported Languages</div>
            <div className="text-gray-900 font-semibold">{editableLanguages.length} configured</div>
          </div>
          <button
            onClick={async () => {
              setSavingAll(true);
              setSaveMsg(null);
              try {
                await updateAdminSettings({ platform: { supportedLanguages: editableLanguages } } as Partial<AdminSettings>);
                setSaveMsg('Supported languages saved');
              } catch (e: any) {
                setSaveMsg(e?.message || 'Failed to save supported languages');
              } finally {
                setSavingAll(false);
                setTimeout(() => setSaveMsg(null), 3000);
              }
            }}
            disabled={savingAll}
            className="px-4 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90 disabled:opacity-50 text-sm"
          >
            {savingAll ? 'Saving…' : 'Save All'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Enabled</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Label</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Native Name</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Flag</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {editableLanguages.map((l, idx) => (
                <tr key={l.code}>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={Boolean(l.enabled)}
                      onChange={(e) => setEditableLanguages(prev => prev.map((x,i) => i===idx ? { ...x, enabled: e.target.checked } : x))}
                    />
                  </td>
                  <td className="px-4 py-2 text-gray-900 font-medium">{l.code.toUpperCase()}</td>
                  <td className="px-4 py-2">
                    <input
                      className="w-40 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      value={l.label || ''}
                      onChange={(e) => setEditableLanguages(prev => prev.map((x,i) => i===idx ? { ...x, label: e.target.value } : x))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-48 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      value={l.nativeName || ''}
                      onChange={(e) => setEditableLanguages(prev => prev.map((x,i) => i===idx ? { ...x, nativeName: e.target.value } : x))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-36 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g. 🇺🇸"
                      value={l.flag || ''}
                      onChange={(e) => setEditableLanguages(prev => prev.map((x,i) => i===idx ? { ...x, flag: e.target.value } : x))}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => setEditableLanguages(prev => prev.filter((_, i) => i !== idx))}
                      className="text-sm text-red-600 hover:underline"
                    >Remove</button>
                  </td>
                </tr>
              ))}
              {editableLanguages.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>No languages configured.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <button
            onClick={() => setEditableLanguages(prev => [...prev, { code: '', label: '', nativeName: '', flag: '', enabled: true }])}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
          >Add Row</button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32 text-gray-500">Loading languages…</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-500">Total Countries</div>
              <div className="text-2xl font-bold text-gray-900">{countries.length}</div>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-500">Languages Detected</div>
              <div className="text-2xl font-bold text-gray-900">{languages.length}</div>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-500">Most Common</div>
              <div className="text-lg font-semibold text-gray-900">
                {languages[0] ? `${languages[0].code.toUpperCase()} (${languages[0].countriesCount} countries)` : '—'}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Countries</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Examples</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((lang) => (
                  <tr key={lang.code}>
                    <td className="px-6 py-3 font-semibold text-gray-900">{lang.code.toUpperCase()}</td>
                    <td className="px-6 py-3 text-gray-700">{lang.countriesCount}</td>
                    <td className="px-6 py-3 text-gray-700">
                      {lang.countryNames.length > 0 ? lang.countryNames.join(', ') : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-center text-gray-500" colSpan={3}>No languages match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
  </div>
);
};

export default LanguagesManagement; 