import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient

from studiotbelt.api.app import app


class ApiEndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check_branding(self):
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('status'), 'ok')
        self.assertEqual(data.get('service'), 'tBelt Studio')

    def test_api_health_binaries(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('status'), 'ok')
        self.assertIn('binaries', data)
        self.assertIn('ffmpeg', data['binaries'])
        self.assertIn('rubberband', data['binaries'])
        self.assertIn('python', data['binaries'])

    def test_get_settings_structure(self):
        response = self.client.get('/api/settings')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('active_provider', data)
        self.assertIn('providers', data)
        self.assertIn('fal', data['providers'])
        self.assertIn('enhancor', data['providers'])

    def test_update_settings_whitelisting(self):
        with patch('studiotbelt.services.providers.ENV_PATH') as mock_env_path, \
             patch('studiotbelt.services.providers.os.chmod'):
            mock_env_path.exists.return_value = False
            mock_env_path.read_text.return_value = ''
            payload = {
                'provider': 'fal',
                'key': 'test_fal_key',
                'extra': {
                    'FAL_KEY': 'test_fal_key',
                    'DISALLOWED_ENV_INJECTION': 'malicious_value'
                }
            }
            response = self.client.post('/api/settings', json=payload)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data.get('active_provider'), 'fal')

    def test_invalid_job_id_returns_404(self):
        # Must reject malformed or non-hex job IDs
        response = self.client.get('/jobs/invalid-id')
        self.assertEqual(response.status_code, 404)
        response_bad_hex = self.client.get('/jobs/1234567890abcdef1234567890abcdefZZ')
        self.assertEqual(response_bad_hex.status_code, 404)

    def test_list_templates(self):
        response = self.client.get('/api/templates')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('templates', data)
        self.assertGreaterEqual(len(data['templates']), 1)
        tpl = data['templates'][0]
        self.assertEqual(tpl.get('id'), 'rap-god')
        self.assertIn('scenes', tpl)

    def test_load_template(self):
        response = self.client.post('/api/templates/rap-god/load')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('templateId'), 'rap-god')
        self.assertEqual(data.get('state'), 'done')
        self.assertIn('jobId', data)
        # Clean up created run
        from pathlib import Path
        import shutil
        folder = Path('runs') / data['jobId']
        if folder.exists():
            shutil.rmtree(folder)


if __name__ == '__main__':
    unittest.main()
