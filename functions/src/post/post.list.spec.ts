
import { Router } from "../router/router";
import * as assert from 'assert';
// import { Settings } from "../helper";
// import { PERMISSION_DEFINED, CATEGORY_NOT_EXISTS, MISSING_INPUT, INVALID_INPUT, TITLE_DELETED, CONTENT_DELETED } from "../defines";
import { System } from "../system/system";
import { TestSettings } from "../settings";
import { forceUserLoginByEmail, forceUserLogout, setAdminLogin } from "../helpers/global-functions";
import { CategoryDatas } from "../category/category.interfaces";
import { PostData } from './post.interfaces';

// import { WriteResult } from "@google-cloud/firestore";
// import { System } from "../system/system";
// import { EngineSettings } from "../settings";
// import { System } from "../system/system";



const noOfPosts: number = 6;

describe('Post list', function () {
    this.timeout(10000);

    forceUserLogout();
    System.debug = true;

    const tempCategory = {
        id: 'post-list-test-category-id' + (new Date).getTime(),
        title: 'Post List Temp Category',
    };


    it(`Post pagination by creating ${noOfPosts} posts.`, async () => {


        // ===========> Create a category
        setAdminLogin();
        const routerCategory = new Router('category.create');
        let category: CategoryDatas = await routerCategory.run({ id: tempCategory.id, title: tempCategory.title });

        // console.log('category', category);
        assert.equal(typeof category.id === 'string', true);
        assert.equal(category.id, tempCategory.id);



        // Create posts
        await forceUserLoginByEmail(TestSettings.testUserEmail);
        const route = new Router('post.create');

        for (let i = 0; i < noOfPosts; i++) {
            const title = `title ${i}`;
            const content = `content ${i}`;
            const post: PostData = await route.run<PostData>({
                categories: [tempCategory.id],
                title: title,
                content: content
            });
            // console.log(post);
            assert.equal(typeof post.id === 'string', true);
            assert.equal(typeof post.id === 'string', true);

        }

        // Get posts

        const routerList = new Router('post.list');
        const posts = await routerList.run({
            categories: [tempCategory.id],
            orderBy: 'createdAt',
            orderBySort: 'desc',
        });
        if (posts.error !== void 0) {
            console.log(posts);
        }

        assert.equal(posts.length === noOfPosts, true);

        // console.log('posts', posts);
        const first3 = await routerList.run({
            categories: [tempCategory.id],
            orderBy: 'createdAt',
            orderBySort: 'desc',
            limit: 3
        });

        assert.equal(first3.length === 3, true);

        // console.log('first3: ', first3);

        for (let j = 0; j < first3.length; j++) {
            assert.equal(posts[j].created, first3[j].created);
        }


        // console.log('posts', posts);
        const second3 = await routerList.run({
            categories: [tempCategory.id],
            startAfter: first3[first3.length - 1].created,
            limit: 3
        });

        assert.equal(first3.length === 3, true);

        // console.log('first3: ', first3);

        for (let j = 0; j < first3.length; j++) {
            assert.equal(posts[j + 3].created, second3[j].created);
        }

    });


});
