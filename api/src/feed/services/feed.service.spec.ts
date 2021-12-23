import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../auth/models/user.class';
import { FeedService } from '../services/feed.service';
import { FeedPost } from '../models/post.interface';
import { DeleteResult, UpdateResult } from 'typeorm';
import { FeedPostEntity } from '../models/post.entity';
const httpMocks = require('node-mocks-http');

describe('FeedService', () => {
    let feedService: FeedService;

    const mockRequest = httpMocks.createRequest();
    mockRequest.user = new User();
    mockRequest.user.firstName = 'user2';

    const mockFeedPost: FeedPost = {
        body: 'body',
        createdAt: new Date(),
        author: mockRequest.user
    }

    const mockFeedPostRepository = {
        createPost: jest.fn().mockImplementation((user: User, feedPost: FeedPost) => {
            return {
                ...feedPost,
                author: user
            }
        }),
        save: jest.fn().mockImplementation((feedPost: FeedPost) => Promise.resolve({
            id: 1, ...feedPost
        }))
    };

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            providers: [
                FeedService,
                {
                    provide: getRepositoryToken(FeedPostEntity),
                    useValue: mockFeedPostRepository
                }
            ]
        })
            .compile();

        feedService = moduleRef.get<FeedService>(FeedService);
    });

    it('should be defined', () => {
        expect(feedService).toBeDefined();
    });

    it('should create a feed post', (done: jest.DoneCallback) => {
        feedService.createPost(mockRequest.user, mockFeedPost).subscribe((feedPost: FeedPost) => {
            expect(feedPost).toEqual({
                id: expect.any(Number),
                ...mockFeedPost
            });
            done();
        })
    });
})
