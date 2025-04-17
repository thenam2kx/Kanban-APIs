import slugify from 'slugify';

const convertSlugUrl = (string: string) => {
  if (!string) return '';

  const slug = slugify(string, {
    lower: true,
    locale: 'vi',
  });

  return slug;
};

export default convertSlugUrl;
