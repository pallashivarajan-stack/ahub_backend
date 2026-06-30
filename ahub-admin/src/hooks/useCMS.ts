import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

// --- Hero ---
export const useHero = () => {
  return useQuery({
    queryKey: ['hero'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/hero');
      return data;
    },
  });
};

export const useUpdateHero = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.put('/api/v1/hero', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero'] });
    },
  });
};

// --- Portfolio Companies ---
export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/companies');
      return data;
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/v1/companies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/api/v1/companies/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

// --- Incubators ---
export const useIncubators = () => {
  return useQuery({
    queryKey: ['incubators'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/incubators');
      return data;
    },
  });
};

export const useCreateIncubator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/v1/incubators', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incubators'] });
    },
  });
};

export const useUpdateIncubator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/api/v1/incubators/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incubators'] });
    },
  });
};

export const useDeleteIncubator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/incubators/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incubators'] });
    },
  });
};

// --- Events ---
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/events');
      return data;
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/v1/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/api/v1/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// --- Awards ---
export const useAwards = () => {
  return useQuery({
    queryKey: ['awards'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/awards');
      return data;
    },
  });
};

export const useCreateAward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/v1/awards', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
    },
  });
};

export const useUpdateAward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/api/v1/awards/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
    },
  });
};

export const useDeleteAward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/awards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
    },
  });
};

// --- Statistics ---
export const useStatistics = () => {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/statistics');
      return data;
    },
  });
};

export const useCreateStatistic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/v1/statistics', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};

export const useUpdateStatistic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/api/v1/statistics/${id}`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};

// --- Social Links ---
export const useSocialLinks = () => {
  return useQuery({
    queryKey: ['socialLinks'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/social-links');
      return data;
    },
  });
};

export const useCreateSocialLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/v1/social-links', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
};

export const useUpdateSocialLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/api/v1/social-links/${id}`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
};

export const useDeleteSocialLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/social-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
};

// --- Media ---
export const useMedia = () => {
  return useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/media');
      return data;
    },
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/v1/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

// --- Board Members ---
export const useBoardMembers = () => {
  return useQuery({
    queryKey: ['boardMembers'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/board');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const useCreateBoardMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberData: any) => {
      const { data } = await api.post('/api/admin/board', memberData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardMembers'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'board'] });
    },
  });
};

export const useUpdateBoardMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, memberData }: { id: number; memberData: any }) => {
      const { data } = await api.put(`/api/admin/board/${id}`, memberData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardMembers'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'board'] });
    },
  });
};

export const useDeleteBoardMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/board/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardMembers'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'board'] });
    },
  });
};

export const useReorderBoardMembers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      const { data } = await api.put('/api/admin/board/reorder', items);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardMembers'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'board'] });
    },
  });
};

export const useUploadBoardMemberImage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/admin/board/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data; // returns { image_url: string }
    },
  });
};

// --- Team Members ---
export const useTeamMembers = () => {
  return useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/team');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberData: any) => {
      const { data } = await api.post('/api/admin/team', memberData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'team'] });
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, memberData }: { id: number; memberData: any }) => {
      const { data } = await api.put(`/api/admin/team/${id}`, memberData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'team'] });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/team/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'team'] });
    },
  });
};

export const useReorderTeamMembers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      const { data } = await api.put('/api/admin/team/reorder', items);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'team'] });
    },
  });
};

export const useUploadTeamMemberImage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/admin/team/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data; // returns { image_url: string }
    },
  });
};

// --- Team Page ---
export const useTeamPage = () => {
  return useQuery({
    queryKey: ['teamPage'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/team-page');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const useUpdateTeamPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pageData: any) => {
      const { data } = await api.put('/api/admin/team-page', pageData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamPage'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'teamPage'] });
    },
  });
};

export const useUploadTeamPageImage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/admin/team-page/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data; // returns { image_url: string }
    },
  });
};

// --- Mentors ---
export const useMentors = () => {
  return useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/mentors');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const useCreateMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mentorData: any) => {
      const { data } = await api.post('/api/admin/mentors', mentorData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'mentors'] });
    },
  });
};

export const useUpdateMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, mentorData }: { id: number; mentorData: any }) => {
      const { data } = await api.put(`/api/admin/mentors/${id}`, mentorData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'mentors'] });
    },
  });
};

export const useDeleteMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/mentors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'mentors'] });
    },
  });
};

export const useReorderMentors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      const { data } = await api.put('/api/admin/mentors/reorder', items);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'mentors'] });
    },
  });
};

export const useUploadMentorImage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/admin/mentors/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data; // returns { image_url: string }
    },
  });
};

// --- Case Studies ---
export const useCaseStudies = () => {
  return useQuery({
    queryKey: ['caseStudies'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/case-studies');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
  });
};

export const useCreateCaseStudy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studyData: any) => {
      const { data } = await api.post('/api/admin/case-studies', studyData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseStudies'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'caseStudies'] });
    },
  });
};

export const useUpdateCaseStudy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, studyData }: { id: number; studyData: any }) => {
      const { data } = await api.put(`/api/admin/case-studies/${id}`, studyData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseStudies'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'caseStudies'] });
    },
  });
};

export const useDeleteCaseStudy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/case-studies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseStudies'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'caseStudies'] });
    },
  });
};

export const useReorderCaseStudies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      const { data } = await api.put('/api/admin/case-studies/reorder', items);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseStudies'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'caseStudies'] });
    },
  });
};

export const useUploadCaseStudyImage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/admin/case-studies/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data; // returns { image_url: string }
    },
  });
};

// --- Press ---
export const usePress = () => {
  return useQuery({
    queryKey: ['press'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/press');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
  });
};

export const useCreatePressItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemData: any) => {
      const { data } = await api.post('/api/admin/press', itemData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['press'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'press'] });
    },
  });
};

export const useUpdatePressItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, itemData }: { id: number; itemData: any }) => {
      const { data } = await api.put(`/api/admin/press/${id}`, itemData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['press'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'press'] });
    },
  });
};

export const useDeletePressItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/press/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['press'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'press'] });
    },
  });
};

export const useReorderPress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      const { data } = await api.put('/api/admin/press/reorder', items);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['press'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'press'] });
    },
  });
};

// --- Press Page ---
export const usePressPage = () => {
  return useQuery({
    queryKey: ['pressPage'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/press-page');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
  });
};

export const useUpdatePressPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pageData: any) => {
      const { data } = await api.put('/api/admin/press-page', pageData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pressPage'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'pressPage'] });
    },
  });
};

// ── Image Upload (Vision/Roadmap/Milestones) ──
export const useUploadVisionRoadmapImage = () => {
  return useMutation({
    mutationFn: async ({ entityType, formData }: { entityType: string; formData: FormData }) => {
      const { data } = await api.post(`/api/admin/vision-roadmap/upload-image/${entityType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
  });
};

// ── Vision / Mission ──
export const useVisionMission = () => {
  return useQuery({
    queryKey: ['visionMission'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/vision-mission');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
  });
};

export const useUpdateVisionMission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, itemData }: { id: number; itemData: any }) => {
      const { data } = await api.put(`/api/admin/vision-mission/${id}`, itemData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visionMission'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'visionMission'] });
    },
  });
};

// ── Roadmap ──
export const useRoadmap = () => {
  return useQuery({
    queryKey: ['roadmap'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/roadmap');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
  });
};

export const useUpdateRoadmap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, itemData }: { id: number; itemData: any }) => {
      const { data } = await api.put(`/api/admin/roadmap/${id}`, itemData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'roadmap'] });
    },
  });
};

// ── Milestones ──
export const useMilestones = () => {
  return useQuery({
    queryKey: ['milestones'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/milestones');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
  });
};

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemData: any) => {
      const { data } = await api.post('/api/admin/milestones', itemData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'milestones'] });
    },
  });
};

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, itemData }: { id: number; itemData: any }) => {
      const { data } = await api.put(`/api/admin/milestones/${id}`, itemData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'milestones'] });
    },
  });
};

export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/milestones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'milestones'] });
    },
  });
};

// ── Startups ──
export const useStartups = () => {
  return useQuery({
    queryKey: ['startups'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/startups');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
  });
};

export const useCreateStartup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (startupData: any) => {
      const { data } = await api.post('/api/admin/startups', startupData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startups'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'startupPortfolio'] });
    },
  });
};

export const useUpdateStartup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, startupData }: { id: number; startupData: any }) => {
      const { data } = await api.put(`/api/admin/startups/${id}`, startupData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startups'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'startupPortfolio'] });
    },
  });
};

export const useDeleteStartup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/startups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startups'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'startupPortfolio'] });
    },
  });
};

export const useReorderStartups = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      const { data } = await api.put('/api/admin/startups/reorder', items);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startups'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'startupPortfolio'] });
    },
  });
};

export const useUploadStartupImage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/admin/startups/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data; // returns { image_url: string }
    },
  });
};

export const useReorderMilestones = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      const { data } = await api.put('/api/admin/milestones/reorder', items);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'milestones'] });
    },
  });
};

// ── Infrastructure ──
export const useInfrastructureItems = () => {
  return useQuery({
    queryKey: ['infrastructure'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/infrastructure');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
  });
};

export const useCreateInfrastructureItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemData: any) => {
      const { data } = await api.post('/api/admin/infrastructure', itemData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'infrastructure'] });
    },
  });
};

export const useUpdateInfrastructureItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, itemData }: { id: number; itemData: any }) => {
      const { data } = await api.put(`/api/admin/infrastructure/${id}`, itemData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'infrastructure'] });
    },
  });
};

export const useDeleteInfrastructureItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/infrastructure/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'infrastructure'] });
    },
  });
};

export const useUploadInfrastructureImage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/admin/infrastructure/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
  });
};

export const useReorderInfrastructureItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      const { data } = await api.put('/api/admin/infrastructure/reorder', items);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure'] });
    },
  });
};

// --- Partners ---
export const usePartners = () => {
  return useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/partner-items');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partnerData: any) => {
      const { data } = await api.post('/api/admin/partner-items', partnerData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'partnerItems'] });
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, partnerData }: { id: number; partnerData: any }) => {
      const { data } = await api.put(`/api/admin/partner-items/${id}`, partnerData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'partnerItems'] });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/partner-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'partnerItems'] });
    },
  });
};

export const useReorderPartners = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      const { data } = await api.put('/api/admin/partner-items/reorder', items);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'partnerItems'] });
    },
  });
};

export const useUploadPartnerImage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/api/admin/partner-items/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data; // returns { image_url: string }
    },
  });
};

// --- Join Us Form Config ---
export const useJoinUsConfig = (formType: string = "join_us") => {
  return useQuery({
    queryKey: ['joinUsConfig', formType],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/join-us/config?form_type=${formType}`);
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
  });
};

export const useUpdateJoinUsConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ formType, configData }: { formType: string; configData: any }) => {
      const { data } = await api.put(`/api/admin/join-us/config?form_type=${formType}`, configData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['joinUsConfig'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'joinUsConfig'] });
    },
  });
};

// --- Join Us Submissions ---
export const useJoinUsSubmissions = (formType: string = "join_us", params?: { search?: string; status?: string; page?: number }) => {
  return useQuery({
    queryKey: ['joinUsSubmissions', formType, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({ form_type: formType });
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.page) searchParams.set('page', String(params.page));
      const { data } = await api.get(`/api/admin/join-us/submissions?${searchParams}`);
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
  });
};

export const useDeleteJoinUsSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/join-us/submissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['joinUsSubmissions'] });
    },
  });
};

// --- Impact Metrics ---
export const useImpactMetrics = () => {
  return useQuery({
    queryKey: ['impactMetrics'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/impact-metrics');
      return data;
    },
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const useCreateImpactMetric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (metricData: any) => {
      const { data } = await api.post('/api/admin/impact-metrics', metricData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impactMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'impact'] });
    },
  });
};

export const useUpdateImpactMetric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, metricData }: { id: number; metricData: any }) => {
      const { data } = await api.put(`/api/admin/impact-metrics/${id}`, metricData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impactMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'impact'] });
    },
  });
};

export const useDeleteImpactMetric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/impact-metrics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impactMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'impact'] });
    },
  });
};
