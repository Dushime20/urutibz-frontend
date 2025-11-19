import React, { useEffect, useMemo, useState } from 'react';
import { Languages, Filter, Plus, Search, Globe, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { fetchCountries, fetchAdminSettings, updateAdminSettings } from '../service';
import type { AdminSettings } from '../service';

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
  const [showFilters, setShowFilters] = useState(false);

  // Respect global theme; do not force dark mode here
  useEffect(() => {
    // no-op
  }, []);

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
        setError(e?.message || tSync('Failed to load countries'));
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            <TranslatedText text="Loading languages..." />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            <TranslatedText text="Languages" />
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            <TranslatedText text="Manage platform languages and localization settings" />
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tSync('Search by code or country...')}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl transition-colors flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            <TranslatedText text="Filter" />
          </button>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            <TranslatedText text="Add Language" />
          </button>
        </div>
      </div>

      {/* Default Language Selector */}
      <div className="mb-6 p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <TranslatedText text="Default Platform Language" />
            </div>
            <div className="text-gray-900 dark:text-white font-semibold">
              {defaultLang ? defaultLang.toUpperCase() : tSync('Not set')}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={defaultLang}
              onChange={(e) => setDefaultLang(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">{tSync('Select language')}</option>
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
                  setSaveMsg(tSync('Default language saved'));
                } catch (e: any) {
                  setSaveMsg(e?.message || tSync('Failed to save default language'));
                } finally {
                  setSavingDefault(false);
                  setTimeout(() => setSaveMsg(null), 3000);
                }
              }}
              disabled={!defaultLang || savingDefault}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 text-sm transition-colors"
            >
              {savingDefault ? tSync('Saving…') : tSync('Save')}
            </button>
          </div>
        </div>
        {saveMsg && (
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">{saveMsg}</div>
        )}
      </div>

      {/* Editable Supported Languages */}
      <div className="mb-6 p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <TranslatedText text="Supported Languages" />
            </div>
            <div className="text-gray-900 dark:text-white font-semibold">
              {editableLanguages.length} {tSync('configured')}
            </div>
          </div>
          <button
            onClick={async () => {
              setSavingAll(true);
              setSaveMsg(null);
              try {
                await updateAdminSettings({ platform: { supportedLanguages: editableLanguages } } as Partial<AdminSettings>);
                setSaveMsg(tSync('Supported languages saved'));
              } catch (e: any) {
                setSaveMsg(e?.message || tSync('Failed to save supported languages'));
              } finally {
                setSavingAll(false);
                setTimeout(() => setSaveMsg(null), 3000);
              }
            }}
            disabled={savingAll}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 text-sm transition-colors"
          >
            {savingAll ? tSync('Saving…') : tSync('Save All')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  <TranslatedText text="Enabled" />
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  <TranslatedText text="Code" />
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  <TranslatedText text="Label" />
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  <TranslatedText text="Native Name" />
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  <TranslatedText text="Flag" />
                </th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {editableLanguages.map((l, idx) => (
                <tr key={l.code} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={Boolean(l.enabled)}
                      onChange={(e) => setEditableLanguages(prev => prev.map((x,i) => i===idx ? { ...x, enabled: e.target.checked } : x))}
                      className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 bg-white dark:bg-gray-700"
                    />
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white font-medium">{l.code.toUpperCase()}</td>
                  <td className="px-4 py-2">
                    <input
                      className="w-40 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      value={l.label || ''}
                      onChange={(e) => setEditableLanguages(prev => prev.map((x,i) => i===idx ? { ...x, label: e.target.value } : x))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-48 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      value={l.nativeName || ''}
                      onChange={(e) => setEditableLanguages(prev => prev.map((x,i) => i===idx ? { ...x, nativeName: e.target.value } : x))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-36 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder={tSync('e.g. 🇺🇸')}
                      value={l.flag || ''}
                      onChange={(e) => setEditableLanguages(prev => prev.map((x,i) => i===idx ? { ...x, flag: e.target.value } : x))}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => setEditableLanguages(prev => prev.filter((_, i) => i !== idx))}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      <TranslatedText text="Remove" />
                    </button>
                  </td>
                </tr>
              ))}
              {editableLanguages.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
                    <TranslatedText text="No languages configured." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <button
            onClick={() => setEditableLanguages(prev => [...prev, { code: '', label: '', nativeName: '', flag: '', enabled: true }])}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <TranslatedText text="Add Row" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-red-700 dark:text-red-400">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                  <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="ml-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Total Countries" /></div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{countries.length}</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Languages Detected" /></div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{languages.length}</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Most Common" /></div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {languages[0] ? `${languages[0].code.toUpperCase()} (${languages[0].countriesCount} countries)` : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <TranslatedText text="Code" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <TranslatedText text="Countries" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <TranslatedText text="Examples" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((lang) => (
                  <tr key={lang.code} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-3 font-semibold text-gray-900 dark:text-white">{lang.code.toUpperCase()}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{lang.countriesCount}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                      {lang.countryNames.length > 0 ? lang.countryNames.join(', ') : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                <td className="px-6 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={3}>
                  <TranslatedText text="No languages match your search." />
                </td>
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