import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const LanguageSettings = () => {
  const [languagePreference, setLanguagePreference] = useState('English + Tamil');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data && res.data.settings) {
        const langSetting = res.data.settings.find(s => s.settingKey === 'emailLanguagePreference');
        if (langSetting) {
          setLanguagePreference(langSetting.settingValue);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      await api.put('/settings/emailLanguagePreference', { settingValue: languagePreference });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings', error);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Communication Preferences</h2>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      ) : (
        <form onSubmit={saveSettings} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Email & PDF Language Preference
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Select the language format for all customer-facing emails and PDF invoices (e.g., Loan Closure, Ornament Release, Payment Receipts).
            </p>
            
            <div className="space-y-3">
              {[
                { value: 'English + Tamil', label: 'English & Tamil (Bilingual)', desc: 'Display both English and Tamil content.' },
                { value: 'English', label: 'English Only', desc: 'Display content in English only.' },
                { value: 'Tamil', label: 'Tamil Only', desc: 'Display content in Tamil only.' }
              ].map(option => (
                <label key={option.value} className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${languagePreference === option.value ? 'bg-amber-50 border-amber-500' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name="language"
                      value={option.value}
                      checked={languagePreference === option.value}
                      onChange={(e) => setLanguagePreference(e.target.value)}
                      className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className={`block font-medium ${languagePreference === option.value ? 'text-amber-900' : 'text-gray-900'}`}>
                      {option.label}
                    </span>
                    <span className="block text-gray-500 mt-1">{option.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LanguageSettings;
