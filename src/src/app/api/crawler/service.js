import prisma from '@/lib/prisma';
import axios from 'axios';
import { load } from 'cheerio';


// Fetch latest AI blogs
async function fetchLatestBlogs() {
    try {
        const response = await axios.get('https://towardsdatascience.com/tagged/artificial-intelligence');
        const $ = load(response.data);

        const blogs = [];
        $('.wp-block-post').each((_, element) => {
            const title = $(element).find('h2').text();
            const url = $(element).find('a').attr('href');
            const excerpt = $(element).find('p').text();

            if (title && url) {
                blogs.push({ title, url, excerpt });
            }
        });

        // Save blogs to the database
        await prisma.blog.createMany({
            data: blogs,
            skipDuplicates: true,  // Ignores duplicate URLs
        });

        console.log(`Fetched and stored ${blogs.length} AI blogs.`);
        return blogs;
    } catch (error) {
        console.error('Failed to fetch blogs', error);
        return [];
    }
}

// Fetch latest AI videos from YouTube
async function fetchLatestVideos() {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: process.env.YOUTUBE_API_KEY,
                q: 'Artificial Intelligence',
                part: 'snippet',
                type: 'video',
                maxResults: 5,
            },
        });

        const videos = response.data.items.map((item) => ({
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            description: item.snippet.description,
            image: item.snippet.thumbnails.high.url,
            category: 'AI',
            tags: ['AI', 'Machine Learning'],
        }));

        // Save videos to the database
        await prisma.video.createMany({
            data: videos,
            skipDuplicates: true,  // Ignores duplicate URLs
        });

        console.log(`Fetched and stored ${videos.length} AI videos.`);
        return videos;
    } catch (error) {
        console.error('Failed to fetch videos', error);
        return [];
    }
}

// Fetch and store AI blogs & videos
export async function fetchAIContent() {
    try {
        console.log('Running AI content crawler...');
        const blogs = await fetchLatestBlogs();
        const videos = await fetchLatestVideos();
        console.log('AI content crawler completed.');

        return { blogs, videos };
    } catch (error) {
        console.error('Error fetching AI content', error);
        throw new Error('Failed to fetch AI content');
    }
}
