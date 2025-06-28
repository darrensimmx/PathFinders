/** savedRouteSchema
 * savedRoutes: [
  {
    name: { type: String, required: true },
    distance: { type: Number, required: true },
    coordinates: { type: Array, required: true },
    startPoint: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat]
    },
    endPoint: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    createdAt: { type: Date, default: Date.now }
  }
]
geoJson returned from routeGenerator function
{
  "geojson": {
    "type": "LineString",
    "coordinates": [ [...many points...] ]
  },
  "distance": 5304
}
 */

/************************************UNIT TEST ************************************/
const SavedRoute = require('../models/savedRouteModel');

const { default: mongoose } = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server')
const User = require("../models/userModel");
const { addSavedRoute, fetchSavedRoutes, fetchSingleRoute, removeSavedRoute } = require('../controllers/routeController');
const { route } = require('../app');

/**********Mocked Data **********/
let mongoServer;

beforeAll(async () => {
  // spin up in-memory DB
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  //clear users after each test to isolate
  await mongoose.connection.db.collection('users').deleteMany({})
})

let user;

beforeEach(async () => {
  user = new User({
    name: 'TestUser',
    email: 'abc@gmail.com',
    password: 'hashedPW',
    savedRoutes: []
  })
  await user.save();
})

//Add fn
describe('Add Route function with Mocked Data', () => {

  //Able to add a saved route and register on MongoDB
  it('should add a new saved route', async () => {
    const mockedData = {
      name: 'Run on ${now.toISOString()}',
      distance: 5000,
      coordinates: [1, 2],
      startPoint: {
        type: 'Point',
        coordinates: [2, 3]
      },
      endPoint: {
        type: 'Point',
        coordinates: [3, 4]
      }
    }

    const newRoute = await addSavedRoute(user._id, mockedData);
    const savedRoutes = await SavedRoute.find({ user: user._id });

    expect(savedRoutes.length).toBe(1);

    const savedRouteInDB = await SavedRoute.findById(savedRoutes[0]._id);
    expect(savedRouteInDB.distance).toBe(mockedData.distance);
    expect(savedRouteInDB.startPoint.coordinates).toEqual([2, 3]);

    // expect(updatedUser.savedRoutes.length).toBe(1);
    // expect(newRoute.name).toBe(mockedData.name);
    // expect(updatedUser.savedRoutes[0].distance).toBe(mockedData.distance);
    // expect(updatedUser.savedRoutes[0].startPoint.coordinates).toEqual([2,3]);
    // expect(updatedUser.savedRoutes[0].endPoint.coordinates).toEqual([3,4]);
  })
  //Reject if MongoDB user already has 5 routes => warning to user
  it('should not add more than 5 saved routes', async () => {
    const mockedData = Array.from({ length: 5 }).map((_, i) => ({
      name: `Route ${i + 1}`,
      distance: 5000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [2, 3] },
      endPoint: { type: 'Point', coordinates: [3, 4] }
    }));

    //save to mongoDB user
    for (const route of mockedData) {
      await addSavedRoute(user._id, route);
    }


    const extraRoute = {
      name: 'Extra Route',
      distance: 5000,
      coordinates: [3, 4],
      startPoint: { type: 'Point', coordinates: [4, 5] },
      endPoint: { type: 'Point', coordinates: [5, 6] }
    }

    let error;
    try {
      await addSavedRoute(user._id, extraRoute);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('Limit of 5 saved routes for free plan');

    const savedRoutes = await SavedRoute.find({ user: user._id });
    expect(savedRoutes.length).toBe(5) //no added routes
  })
})

//Fetch routes fn
describe('Fetch Route Fn with Mocked Data', () => {
  it('should fetch saved routes', async () => {
    const route1 = {
      name: 'Route1',
      distance: 1000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4] },
      endPoint: { type: 'Point', coordinates: [4, 5] }
    }

    const route2 = {
      name: 'Route2',
      distance: 2000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4] },
      endPoint: { type: 'Point', coordinates: [4, 5] }
    }

    await addSavedRoute(user._id, route1);
    await addSavedRoute(user._id, route2);

    const routes = await fetchSavedRoutes(user._id);

    expect(routes.length).toBe(2);
    expect(routes[0].name).toBe('Route1');
    expect(routes[1].name).toBe('Route2');
  })

})

//fetch single route fn
describe('Fetch Single Route Based on Mocked Id', () => {
  //fetch succesfully if it exists
  it('should return the single route if exists', async () => {
    const newRoute = {
      name: 'MySingle',
      distance: 1000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [1, 2] },
      endPoint: { type: 'Point', coordinates: [2, 3] }
    };
    await addSavedRoute(user._id, newRoute);

    const savedRoutes = await SavedRoute.find({ user: user._id });
    const routeId = savedRoutes[0]._id;
    const route = await fetchSingleRoute(user._id, routeId);

    expect(route.name).toBe('MySingle');
    expect(route.distance).toBe(1000);
  });

  //return error if user doesn't exist
  it('should throw error if user does not exist', async () => {
    let error;
    try {
      await fetchSingleRoute(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId());
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.message).toBe('User not found!');
  });

  //throw error if route doesn't exist
  it('should throw error if route does not exist', async () => {
    let error;
    try {
      await fetchSingleRoute(user._id, new mongoose.Types.ObjectId());
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.message).toBe('Route not found!');
  });
})

//Delete route fn
describe('Delete Route Fn with Mocked Data', () => {
  //Able to delete route from database
  it('should delete route from database', async () => {
    const route3 = {
      name: 'Route3',
      distance: 3000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4] },
      endPoint: { type: 'Point', coordinates: [4, 5] }
    }


    const added = await addSavedRoute(user._id, route3);

    await removeSavedRoute(user._id, added._id);

    const routeInDB = await SavedRoute.findById(added._id);
    expect(routeInDB).toBeNull();

    const savedRoutes = await SavedRoute.find({ user: user._id });
    expect(savedRoutes.length).toBe(0);
  })

  //Give warning if route is not in DB in the first place
  it('should handle removing a non-existing route gracefully', async () => {
    const nonExistentRoute = {
      name: 'NonExistentRoute',
      distance: 3000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4] },
      endPoint: { type: 'Point', coordinates: [4, 5] }
    }

    let error;
    try {
      const fakeRouteId = new mongoose.Types.ObjectId();
      await removeSavedRoute(user._id, fakeRouteId);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('Route not found');
  })
})

/*********Actual Data ***********/

/************************************INTEGRATION TEST ************************************/
const app = require('../app')
const request = require('supertest') // to test for html request to the backend
const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');

/**********Mocked Data **********/
let accessToken;
beforeEach(async () => {
  user = new User({
    name: 'IntegrationTestUser',
    email: 'test@example.com',
    password: 'hashedPassword',
    savedRoutes: []
  });
  await user.save();

  //  Sign a JWT for this user
  accessToken = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' });
});

// Ensure that /api/routes/save, /api/routes and /api/route/:routeId works => e2e w express
describe('HTML request to backend', () => {
  // /api/routes/save
  it('should save a route', async () => {
    const newRoute = {
      name: 'Integration Test Route',
      distance: 1000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4] },
      endPoint: { type: 'Point', coordinates: [5, 6] }
    }

    const res = await request(app)
      .post('/api/saved-routes/save')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ route: newRoute })

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name');
    expect(typeof res.body.name).toBe('string');
    expect(res.body).toHaveProperty('coordinates');
    expect(Array.isArray(res.body.coordinates)).toBe(true);

  })

  // /api/routes - fetches all routes for user
  it('should display the routes saved', async () => {
    const route1 = {
      name: 'Integration Test Route1',
      distance: 1000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4] },
      endPoint: { type: 'Point', coordinates: [5, 6] }
    }
    const route2 = {
      name: 'Integration Test Route2',
      distance: 1000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4] },
      endPoint: { type: 'Point', coordinates: [5, 6] }
    }


    await request(app)
      .post('/api/saved-routes/save')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ route: route1 });

    await request(app)
      .post('/api/saved-routes/save')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ route: route2 });

    const res = await request(app)
      .get('/api/saved-routes')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200)
    expect(res.body.routes).toBeDefined();
    expect(Array.isArray(res.body.routes)).toBe(true);

    expect(res.body.routes.length).toBe(2);
    expect(res.body.routes[0].name).toBe('Integration Test Route1')
    expect(res.body.routes[1].name).toBe('Integration Test Route2')
  })

  // /api/route/:routeId - fetch one specific route by its ID
  it('should display routeId', async () => {
    const route3 = {
      name: 'Integration Test Route3',
      distance: 1000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4] },
      endPoint: { type: 'Point', coordinates: [5, 6] }
    }
    const route4 = {
      name: 'Integration Test Route4',
      distance: 1000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4] },
      endPoint: { type: 'Point', coordinates: [5, 6] }
    }

    await request(app)
      .post('/api/saved-routes/save')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ route: route3 });

    await request(app)
      .post('/api/saved-routes/save')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ route: route4 });

    //since we are using mongoId, we have to save it first in the DB
    const savedRoutes = await SavedRoute.find({ user: user._id });
    const route3Id = savedRoutes.find(r => r.name === 'Integration Test Route3')._id;
    const res = await request(app)
      .get(`/api/saved-routes/${route3Id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Integration Test Route3')
  })

  // /api/route/:routeId => delete path
  it('should delete the route selected', async () => {
    const route5 = {
      name: 'Integration Test Route5',
      distance: 1000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4] },
      endPoint: { type: 'Point', coordinates: [5, 6] }
    }
    const route6 = {
      name: 'Integration Test Route6',
      distance: 1000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4] },
      endPoint: { type: 'Point', coordinates: [5, 6] }
    }
    await request(app)
      .post('/api/saved-routes/save')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ route: route5 })
    await request(app)
      .post('/api/saved-routes/save')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ route: route6 })

    // console.log(updatedUser.savedRoutes[0])
    const savedRoutesBefore = await SavedRoute.find({ user: user._id });
    const route5Id = savedRoutesBefore.find(r => r.name === 'Integration Test Route5')._id;

    const res = await request(app)
      .delete(`/api/saved-routes/${route5Id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe("Route Deleted")

    const updatedUserAfterDelete = await SavedRoute.find({ user: user._id });
    expect(updatedUserAfterDelete.length).toBe(1);
    expect(updatedUserAfterDelete[0].name).toBe('Integration Test Route6');
  })

})