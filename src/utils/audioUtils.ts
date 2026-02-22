/**
 * Utility to transform story data for audio player
 * Splits story into pages based on text content
 */

interface Page {
  pageNumber: number;
  audioUrl: string;
  duration: number;
  text?: string;
}

interface Story {
  _id?: string;
  id?: string;
  title: string;
  author?: string;
  coverImage?: string;
  audioUrl: string;
  textContent?: string;
  duration: number;
  pages?: Page[];
}

export const transformStoryForPlayer = (story: any): Story => {
  // If story already has pages, return as is
  if (story.pages && Array.isArray(story.pages)) {
    return story;
  }

  // Calculate pages based on 1 minute (60 seconds) per page
  const totalDurationSeconds = story.duration || 0;
  const secondsPerPage = 60; // 1 minute per page
  const numberOfPages = Math.ceil(totalDurationSeconds / secondsPerPage);
  
  console.log(`📄 Audio duration: ${totalDurationSeconds}s, Creating ${numberOfPages} pages (60s each)`);
  
  // Split text content to match audio pages
  const textContent = story.textContent || '';
  const charsPerPage = Math.floor(textContent.length / numberOfPages) || 500;
  
  const pages: Page[] = [];
  let currentPos = 0;
  
  for (let i = 0; i < numberOfPages; i++) {
    let endPos = Math.min(currentPos + charsPerPage, textContent.length);
    
    // Find last space to break at word boundary
    if (endPos < textContent.length && i < numberOfPages - 1) {
      const lastSpace = textContent.lastIndexOf(' ', endPos);
      if (lastSpace > currentPos) {
        endPos = lastSpace;
      }
    }
    
    const pageText = textContent.slice(currentPos, endPos).trim();
    pages.push({
      pageNumber: i + 1,
      audioUrl: story.audioUrl,
      duration: 60000, // 1 minute in milliseconds
      text: pageText || story.description || '',
    });
    
    currentPos = endPos + 1;
  }

  // If no pages created, create at least one
  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      audioUrl: story.audioUrl,
      duration: totalDurationSeconds * 1000,
      text: story.description || '',
    });
  }

  return {
    ...story,
    pages,
  };
};

export const formatTime = (millis: number): string => {
  const min = Math.floor(millis / 60000);
  const sec = Math.floor((millis % 60000) / 1000);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

export const formatDuration = (seconds: number): string => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};
