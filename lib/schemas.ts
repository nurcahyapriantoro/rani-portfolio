import { z } from 'zod';

const stringArray = z.array(z.string());

const id = z.string().min(1);

export const profileSchema = z.object({
  fullName: z.string(),
  nickname: z.string(),
  pronouns: z.string(),
  title: z.string(),
  subtitle: z.string(),
  tagline: z.string(),
  location: z.string(),
  email: z.string().email().or(z.literal('')),
  phone: z.string(),
  whatsapp: z.string(),
  linkedin: z.string().url().or(z.literal('')),
  github: z.string().url().or(z.literal('')),
  instagram: z.string().url().or(z.literal('')),
  cvUrl: z.string(),
  avatarInitials: z.string().max(5),
  avatarColor: z.string(),
  photoUrl: z.string().optional().default('')
});

export const statsSchema = z.object({
  gpa: z.string(),
  experienceCount: z.number().int().nonnegative(),
  awardsCount: z.number().int().nonnegative(),
  publicationsCount: z.number().int().nonnegative()
});

export const bioSchema = z.object({
  short: z.string(),
  long: z.string()
});

export const experienceSchema = z.object({
  id,
  role: z.string(),
  company: z.string(),
  type: z.string(),
  period: z.string(),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  isCurrent: z.boolean().optional().default(false),
  duration: z.string(),
  location: z.string(),
  description: z.string(),
  skills: stringArray,
  achievements: stringArray.optional().default([]),
  companyUrl: z.string().optional().default(''),
  images: z.array(z.string()).optional().default([])
});

export const experiencesSchema = z.array(experienceSchema);

export const skillSchema = z.object({
  name: z.string(),
  category: z.enum(['molecular', 'analysis', 'laboratory', 'soft']),
  level: z.number().min(0).max(100)
});

export const skillsSchema = z.array(skillSchema);

export const publicationSchema = z.object({
  id,
  title: z.string(),
  authors: stringArray,
  venue: z.string(),
  date: z.string(),
  type: z.string(),
  abstract: z.string(),
  url: z.string().url().or(z.literal('')),
  tags: stringArray.optional().default([])
});

export const publicationsSchema = z.array(publicationSchema);

export const awardSchema = z.object({
  id,
  rank: z.string(),
  title: z.string(),
  issuer: z.string(),
  date: z.string(),
  associatedWith: z.string()
});

export const awardsSchema = z.array(awardSchema);

export const educationSchema = z.object({
  id,
  school: z.string(),
  degree: z.string(),
  field: z.string().optional().default(''),
  period: z.string(),
  startYear: z.string().optional().default(''),
  endYear: z.string().optional().default(''),
  location: z.string(),
  description: z.string().optional().default(''),
  achievements: stringArray.optional().default([]),
  logoUrl: z.string().optional().default(''),
  gpa: z.string().optional().default('')
});

export const educationsSchema = z.array(educationSchema);

export const projectSchema = z.object({
  id,
  title: z.string(),
  subtitle: z.string().optional().default(''),
  description: z.string(),
  imageUrl: z.string().optional().default(''),
  impact: z.string().optional().default(''),
  impactLabel: z.string().optional().default('Impact'),
  team: z.string().optional().default(''),
  publishedAt: z.string().optional().default(''),
  venue: z.string().optional().default(''),
  url: z.string().url().or(z.literal('')).optional().default(''),
  tags: stringArray.optional().default([])
});

export const projectsSchema = z.array(projectSchema);

export const certificationSchema = z.object({
  id,
  title: z.string(),
  issuer: z.string(),
  date: z.string(),
  url: z.string().url().or(z.literal('')).optional().default(''),
  credentialId: z.string().optional().default(''),
  description: z.string().optional().default('')
});

export const certificationsSchema = z.array(certificationSchema);

export const volunteeringSchema = z.object({
  id,
  role: z.string(),
  organization: z.string(),
  period: z.string(),
  duration: z.string(),
  category: z.string(),
  description: z.string().optional().default(''),
  location: z.string().optional().default('')
});

export const volunteeringsSchema = z.array(volunteeringSchema);

export const heroSchema = z.object({
  greeting: z.string(),
  scrollLabel: z.string()
});

export const footerSchema = z.object({
  copyright: z.string(),
  tagline: z.string().optional().default(''),
  builtWith: z.string().optional().default(''),
  socials: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string().url().or(z.literal('')),
        icon: z.string().optional().default('')
      })
    )
    .optional()
    .default([])
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type StatsInput = z.infer<typeof statsSchema>;
export type BioInput = z.infer<typeof bioSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type PublicationInput = z.infer<typeof publicationSchema>;
export type AwardInput = z.infer<typeof awardSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type VolunteeringInput = z.infer<typeof volunteeringSchema>;
export type HeroInput = z.infer<typeof heroSchema>;
export type FooterInput = z.infer<typeof footerSchema>;