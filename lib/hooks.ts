import useSWR, { SWRConfiguration } from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  dedupingInterval: 2000,
}

// Tasks hooks
export function useTasks(status?: string, brand?: string) {
  const query = new URLSearchParams()
  if (status) query.append('status', status)
  if (brand) query.append('brand', brand)
  
  const { data, error, isLoading, mutate } = useSWR(
    `/api/tasks?${query.toString()}`,
    fetcher,
    { ...defaultConfig, revalidateInterval: 10000 }
  )

  return {
    tasks: data?.data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export async function executeTask(taskId: string, newStatus: string) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'execute',
      taskId,
      newStatus,
    }),
  })
  return response.json()
}

// Approvals hooks
export function useApprovals(status?: string) {
  const query = status ? `?status=${status}` : ''
  
  const { data, error, isLoading, mutate } = useSWR(
    `/api/approvals${query}`,
    fetcher,
    { ...defaultConfig, revalidateInterval: 15000 }
  )

  return {
    approvals: data?.data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export async function approveItem(approvalId: string, decision: 'approve' | 'refuse') {
  const response = await fetch('/api/approvals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: decision,
      approvalId,
      decision,
    }),
  })
  return response.json()
}

// Automations hooks
export function useAutomations() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/automations',
    fetcher,
    { ...defaultConfig, revalidateInterval: 20000 }
  )

  return {
    automations: data?.data || [],
    overallHealth: data?.overallHealth || 100,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export async function restartAutomation(automationId: string) {
  const response = await fetch('/api/automations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'restart',
      automationId,
    }),
  })
  return response.json()
}

// Status hooks (alerts & incidents)
export function useOperationalStatus() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/status',
    fetcher,
    { ...defaultConfig, revalidateInterval: 5000 } // Most frequent - operational critical
  )

  return {
    alerts: data?.data?.alerts || [],
    incidents: data?.data?.incidents || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export async function resolveAlert(alertId: string) {
  const response = await fetch('/api/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'resolve-alert',
      alertId,
    }),
  })
  return response.json()
}

export async function createIncident(
  severity: string,
  title: string,
  description: string
) {
  const response = await fetch('/api/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create-incident',
      severity,
      title,
      description,
    }),
  })
  return response.json()
}
