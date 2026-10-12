import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient

from app import app


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
        with patch('providers.ENV_PATH') as mock_env_path, \
             patch('providers.os.chmod'):
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


if __name__ == '__main__':
    unittest.main()
