import { WorkshopTopic } from '@/types';

/**
 * Security Topic
 *
 * Covers MongoDB security features beyond encryption, including RBAC,
 * LDAP integration, and auditing.
 */
export const securityTopic: WorkshopTopic = {
  id: 'security',
  name: 'Security & Access Control',
  description: 'RBAC, LDAP integration, auditing, and access control beyond encryption',
  tags: ['security', 'rbac', 'ldap', 'auditing', 'access-control'],
  prerequisites: [],
  povCapabilities: [
    'RBAC',
    'END-USER-RBAC',
    'LDAP',
    'AUDITING'
  ]
};
