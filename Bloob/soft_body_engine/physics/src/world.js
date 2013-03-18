var CollisionCallback = function() {};

CollisionCallback.prototype.collisionFilter = function(bA, bodyApm, bodyB, bodyBpm1, bodyBpm2, hitPt, normalVel) { // Body*, int, Body*, int, int, Vector2, float
	return true;
};
	

var MaterialPair = function() {
	this.Collide = true;
	this.Elasticity = 0.7;
	this.Friction = 0.3;
	this.Callback = new CollisionCallback();
};

// typedef std::vector<Body*>	BodyList;

var BodyCollisionInfo = function() {
	this.bodyA = 0; // Body
	this.bodyB = 0; // Body

	this.bodyApm = 0; // int
	this.bodyBpmA = 0; // int
	this.bodyBpmB = 0; // int

	this.hitPt = new Vector2(0.0, 0.0); // Vector2	
	this.edgeD = 0.0; // float
	this.norm = new Vector2(0.0, 0.0); // Vector2	
	this.penetration = 0.0; // float
};

BodyCollisionInfo.prototype.Clear = function() {
	this.bodyA = 0; // Body
	this.bodyB = 0; // Body

	this.bodyApm = -1; // int
	this.bodyBpmA = -1; // int
	this.bodyBpmB = -1; // int

	this.hitPt = new Vector2(0.0, 0.0); // Vector2	
	this.edgeD = 0.0; // float
	this.norm = new Vector2(0.0, 0.0); // Vector2	
	this.penetration = 0.0; // float
};

BodyCollisionInfo.prototype.Log = function() {
	//printf("BCI bodyA:%d bodyB:%d bApm:%d bBpmA:%d, bBpmB:%d\n", bodyA, bodyB, bodyApm, bodyBpmA, bodyBpmB);
	//printf("	hitPt[%f][%f] edgeD:%f norm[%f][%f] penetration:%f\n",
	//	   hitPt.X, hitPt.Y, edgeD, norm.X, norm.Y, penetration);
};



var World = function() {
	// default values
	this.mBodies = []; // std::vector<Body*>
	this.mWorldLimits = new AABB(); // AABB
	this.mWorldSize = new Vector2(0.0, 0.0); // Vector2
	this.mWorldGridStep = new Vector2(0.0, 0.0); // Vector2
		
	this.mPenetrationThreshold = 0.0; // float
	this.mPenetrationCount = 0; // int
		
	this.mMaterialPairs = []; // MaterialPair*	
	this.mDefaultMatPair = new MaterialPair(); // MaterialPair
	this.mMaterialCount = 0; // int
	
	this.mCollisionList = []; //std::vector<BodyCollisionInfo>
	
	
	// real constructor
	this.mMaterialCount = 1;
	this.mMaterialPairs = [new MaterialPair()];
	this.mDefaultMatPair.Friction = 0.3;
	this.mDefaultMatPair.Elasticity = 0.8;
	this.mDefaultMatPair.Collide = true;
		
	this.mMaterialPairs[0] = this.mDefaultMatPair;
		
	this.setWorldLimits(new Vector2(-20,-20), new Vector2(20,20));
		
	this.mPenetrationThreshold = 0.3;
	this.mPenetrationCount = 0;
};

World.prototype.setWorldLimits = function( min, max) { //  const Vector2& , const Vector2& 
	this.mWorldLimits = new AABB(min, max);
	this.mWorldSize = max.sub(min);
	this.mWorldGridStep = this.mWorldSize / 32;
		
	// update bitmasks for all bodies.
	for(var i = 0; i < this.mBodies.length; i++)
		this.updateBodyBitmask(this.mBodies[i]);
};

// Idea: Devide the world into a 32x32 grid
// determine in which grid spaces the object is present
// adjust its bitmask like this
World.prototype.updateBodyBitmask = function(body) { // Body* 
	var box = body.getAABB(); // AABB
	
	//var minX = Math.floor((box.Min.x - mWorldLimits.Min.x) / this.mWorldGridStep.x); // int
	//var maxX = Math.floor((box.Max.x - mWorldLimits.Min.x) / this.mWorldGridStep.x); // int
	
	//if (minX < 0) { minX = 0; } else if (minX > 31) { minX = 31; }
	//if (maxX < 0) { maxX = 0; } else if (maxX > 31) { maxX = 31; }
	
	// determine minimum and maximum grid 
	var minY = Math.floor((
		box.Min.y - 
		this.mWorldLimits.Min.y
	) / this.mWorldGridStep.y); // int
	var maxY = Math.floor((box.Max.y - this.mWorldLimits.Min.y) / this.mWorldGridStep.y); // int

	// Adjust if object have fallen out of the world
	if (minY < 0) { minY = 0; } else if (minY > 31) { minY = 31; };
	if (maxY < 0) { maxY = 0; } else if (maxY > 31) { maxY = 31; };
	
	
	//body->mBitMaskX.clear();
	//for (int i = minX; i <= maxX; i++)
	//	body->mBitMaskX.setOn(i);
	
	
	body.mBitMaskY.clear();
	for(var i = minY; i <= maxY; i++)
		body.mBitMaskY.setOn(i);
	
	//Console.WriteLine("Body bitmask: minX{0} maxX{1} minY{2} maxY{3}", minX, maxX, minY, minY, maxY);
};

World.prototype.addBody = function(b) { // Body
	DEBUG("addBody:", b);

	// check for already existing.
	var exists = false; // bool
	for(var i = 0; i < this.mBodies.length; i++)
		if(this.mBodies[i] == b) {
			exists = true;
			break;
		};
	
	// do not add an already existing body
	if (!exists)
		this.mBodies.push(b);
};

World.prototype.update = function(timePassed) { // float
	this.mPenetrationCount = 0;
	this.mCollisionList.length = 0;

	// first, accumulate all forces acting on PointMasses.
	for(var i = 0; i < this.mBodies.length; i++)
	{
		var body = this.mBodies[i];

		if(body.getIsStatic() || body.getIgnoreMe()) { continue; }
		
		body.derivePositionAndAngle(timePassed);
		body.accumulateExternalForces();
		body.accumulateInternalForces();
	}
	// now integrate.
	for(var i = 0; i < this.mBodies.length; i++)
	{
		//if this.mBodies[i].getIsStatic()) { continue; }
		
		// hard coded force on first Pointmass
		//this.mBodies[i].mPointMasses[0].Force = new Vector2(0.0,9.81);
		//this.mBodies[i].mPointMasses[0].Mass = 1;
		//Scarlet.log(this.mBodies[i].mPointMasses[0].Position);
		
		this.mBodies[i].integrate(timePassed);
	}

	// update all bounding boxes, and then bitmasks.
	for(var i = 0; i < this.mBodies.length; i++)
	{
		var body = this.mBodies[i];

		if(body.getIsStatic() || body.getIgnoreMe()) { continue; }
		
		body.updateAABB(timePassed);
		this.updateBodyBitmask(body);
		body.updateEdgeInfo();
	}

	// now check for collision.
	//for (var i = 0; i < this.mBodies.length; i++)
	//{
		//var bA = this.mBodies[i]; // Body* 
		//if (bA.getIsStatic() || bA.getIgnoreMe())
			//continue;
		
		
		// // OLD, BRUTE-FORCE COLLISION CHECKS USING BITMASKS ONLY FOR OPTIMIZATION.
		////for (int j = i + 1; j < mBodies.size(); j++)
		////{
		////	_goNarrowCheck( mBodies[i], mBodies[j] );
		////}
		
		
		//var bS = bA.mBoundStart; // Body::BodyBoundary*
		//var bE = bA.mBoundEnd; // Body::BodyBoundary*
		//var cur = bS.next; // Body::BodyBoundary*
		
		//var passedMyEnd = false; // bool
		//while (cur)
		//{
			//if (cur == bE)
			//{
			//	passedMyEnd = true;
			//}
			//else if ((cur.type == Begin) && (!passedMyEnd))
			//{
				// overlapping, do narrow-phase check on this body pair.
			//	this._goNarrowCheck(bA, cur.body);
			//}
			//else if (cur.type == End)
			//{
				// this is an end... the only situation in which we didn't already catch this body from its "begin",
				// is if the begin of this body starts before our own begin.
				//if (cur.body.mBoundStart.value <= bS.value)
				//{
					// overlapping, do narrow-phase check on this body pair.
				//	this._goNarrowCheck(bA, cur.body);
				//}
			//}
			//else if (cur.type == VoidMarker)
			//{
				//break;
			//}
			
			//cur = cur.next;
		//}
	//}
	// TODO: at the moment: only use simple collision check with AABB
	for (var i = 0; i < this.mBodies.length; i++) {
		var bA = this.mBodies[i]; // Body* 
		if (bA.getIsStatic() || bA.getIgnoreMe())
			continue;
		for (var j = i+1; j < this.mBodies.length; j++) {
			this._goNarrowCheck(this.mBodies[i], this.mBodies[j]);
		}
	}

	
	
	
	//printf("\n\n");
	
	// now handle all collisions found during the update at once.
	this._handleCollisions();

	// now dampen velocities.
	for (var i = 0; i < this.mBodies.length; i++)
	{
		if(this.mBodies[i].getIsStatic()) { continue; }
		this.mBodies[i].dampenVelocity();
	}
};

World.prototype._goNarrowCheck = function(bI, bJ) { // Body*, Body*
	//printf("goNarrow %d vs. %d\n", bI, bJ);

	// TODO: something seems to went wrong here
	// - Bitmask do not work -> therefore outcommented
	// grid-based early out.
	//if ( //((bI->mBitMaskX.mask & bJ->mBitMaskX.mask) == 0) && 
		//((bI.mBitMaskY.mask & bJ.mBitMaskY.mask) == 0))
	//{
		//printf("update - no bitmask overlap.\n");
		//return;
	//}

	// early out - these bodies materials are set NOT to collide
	if (!this.mMaterialPairs[(bI.getMaterial() * this.mMaterialCount) + bJ.getMaterial()].Collide)
	{
		//printf("update - material early out: %d vs. %d\n", mBodies[i]->getMaterial(), mBodies[j]->getMaterial());
		return;
	}

	// broad-phase collision via AABB.
	var boxA = bI.getAABB(); // const AABB&
	var boxB = bJ.getAABB(); // const AABB& 

	// early out
	if (!boxA.intersects(boxB))
	{
		//printf("update - no AABB overlap.\n");
		return;
	}

	// okay, the AABB's of these 2 are intersecting.  now check for collision of A against B.
	this.bodyCollide(bI, bJ, this.mCollisionList);
	
	// and the opposite case, B colliding with A
	this.bodyCollide(bJ, bI, this.mCollisionList);
};

World.prototype.bodyCollide = function(bA, bB, infoList) { // Body*, Body*, std::vector<BodyCollisionInfo>&
	var bApmCount = bA.getPointMassCount(); // int
	
	var boxB = bB.getAABB(); // AABB
	
	// check all PointMasses on bodyA for collision against bodyB.  if there is a collision, return detailed info.
	for (var i = 0; i < bApmCount; i++)
	{
		var pt = bA.getPointMass(i).Position; // Vector2
		
		// early out - if this point is outside the bounding box for bodyB, skip it!
		if (!boxB.contains(pt))
		{
			//printf("bodyCollide - bodyB AABB does not contain pt\n");
			continue;
		}
		
		// early out - if this point is not inside bodyB, skip it!
		if (!bB.contains(pt))
		{
			//printf("bodyCollide - bodyB does not contain pt\n");
			continue;
		}
		
		var collisionInfo = this._collisionPointBody(bB, bA, i);
		if(collisionInfo)
			infoList.push(collisionInfo);
		continue;
	}
};

World.prototype._collisionPointBody = function(penetratedBody, bodyOfPoint, indexOfPoint) {
	
	// penetration point variables	
	var pointInPolygon = bodyOfPoint.getPointMass(indexOfPoint).Position
	var normalForPointInPolygon = (function getNormalOfPenetrationPoint(body, i) {
	
		// get index of the previous and next point in pointmasslist
		var numberOfPointMasses = body.getPointMassCount();
		var previosPointIndex = (i > 0) ? i-1 : numberOfPointMasses - 1; // int
		var nextPointIndex = (i < numberOfPointMasses - 1) ? i + 1 : 0; // int
		
		// get previos and next point in pointmasslist
		var previosPoint = body.getPointMass(previosPointIndex).Position; // Vector2
		var nextPoint = body.getPointMass(nextPointIndex).Position; // Vector2
		
		// now get the normal for this point. (NOT A UNIT VECTOR)
		var fromPreviosPoint = pointInPolygon.sub(previosPoint); // Vector2
		var toNextPoint = nextPoint.sub(pointInPolygon); // Vector2
		
		var normalForPoint = fromPreviosPoint.add(toNextPoint); // Vector2
		normalForPoint.makePerpendicular();
	
		return normalForPoint;
	})(bodyOfPoint, indexOfPoint);
	
	// penetrated body variables
	var numberOfPointMasses = penetratedBody.getPointMassCount();
	var indexEdgeStart = numberOfPointMasses;
	var indexEdgeEnd = 0;
	var edgeStart;
	var edgeEnd;
	var normalForEdge;
	
	// result variables
	var resultIndexEdgeStart = -1;
	var resultIndexEdgeEnd = -1;
	var resultPercentageToClosestPoint;
	var resultClosestPointOnEdge;
	var resultDistance = 1000000000.0;
	var resultEdgeNormal;
	
	var opposingEdgeAlreadyFound = false;
	var opposingEdge = false;
	
	while(indexEdgeStart--) {
	
		// Calculate closest point on the line that is tangent to each edge of the polygon.
		edgeStart = penetratedBody.getPointMass(indexEdgeStart).Position;
		edgeEnd = penetratedBody.getPointMass(indexEdgeEnd).Position;
		
		var percentageToClosestPoint = 
			(
				((pointInPolygon.x - edgeStart.x)*(edgeEnd.x - edgeStart.x))
				+
				((pointInPolygon.y - edgeStart.y)*(edgeEnd.y - edgeStart.y))
			)
			/
			(
				Math.pow((edgeEnd.x - edgeStart.x), 2)
				+
				Math.pow((edgeEnd.y - edgeStart.y), 2)
			);
		
		// Calculate closest point on each line segment (edge of the polygon) to the point in question.
		if(percentageToClosestPoint < 0)
			var closestPointOnEdge = edgeStart.copy();
		else if(percentageToClosestPoint > 1)
			var closestPointOnEdge = edgeEnd.copy();
		else
			var closestPointOnEdge = new Vector2(
				edgeStart.x + percentageToClosestPoint * (edgeEnd.x - edgeStart.x),
				edgeStart.y + percentageToClosestPoint * (edgeEnd.y - edgeStart.y)
			);
		
		// Calculate the distance from the closest point on each line segment to the point in question.
		var distance = Math.sqrt(
			Math.pow((pointInPolygon.x - closestPointOnEdge.x), 2) +
			Math.pow((pointInPolygon.y - closestPointOnEdge.y), 2)
		);
		
		var edgeNormal = edgeEnd.sub(edgeStart);
		edgeNormal = /*new Vector2(edgeNormal.y * -1, edgeNormal.x).copy();//*/edgeNormal.getPerpendicular();
		edgeNormal.normalize();
		
		var dot = normalForPointInPolygon.dotProduct(edgeNormal); // float

		opposingEdge = dot <= 0.0;

		// Find the minimum distance.
		if(
			// TODO: is this condition right????
			((!(opposingEdgeAlreadyFound)) && (opposingEdge || distance < resultDistance)) ||
			(opposingEdgeAlreadyFound && opposingEdge && distance < resultDistance)
		) {
			resultDistance = distance;
			resultIndexEdgeStart = indexEdgeStart;
			resultIndexEdgeEnd = indexEdgeEnd;
			resultPercentageToClosestPoint = percentageToClosestPoint;
			resultClosestPointOnEdge = closestPointOnEdge;
			resultEdgeNormal = edgeNormal;
		};
		if(opposingEdge) opposingEdgeAlreadyFound = true;
		
		indexEdgeEnd = indexEdgeStart;
	}
	
	var collisionInfo = new BodyCollisionInfo();
	collisionInfo.bodyA = bodyOfPoint; // Body
	collisionInfo.bodyB = penetratedBody; // Body

	collisionInfo.bodyApm = indexOfPoint; // int
	collisionInfo.bodyBpmA = resultIndexEdgeStart; // int
	collisionInfo.bodyBpmB = resultIndexEdgeEnd; // int

	collisionInfo.hitPt = resultClosestPointOnEdge; // Vector2	
	collisionInfo.edgeD = resultPercentageToClosestPoint; // float
	collisionInfo.norm = resultEdgeNormal; // Vector2	
	collisionInfo.penetration = resultDistance; // float
	return collisionInfo;
};

World.prototype._handleCollisions = function() {
	//printf("handleCollisions - count %d\n", mCollisionList.size());
	
	// handle all collisions!
	for (var i = 0; i < this.mCollisionList.length; i++)
	{
		var info = this.mCollisionList[i]; // BodyCollisionInfo
		
		var A = info.bodyA.getPointMass(info.bodyApm); // PointMass*
		var B1 = info.bodyB.getPointMass(info.bodyBpmA); // PointMass*
		var B2 = info.bodyB.getPointMass(info.bodyBpmB); // PointMass*

		// velocity changes as a result of collision.
		var bVel = (B1.Velocity.add(B2.Velocity)).mulFloat(0.5); // Vector2
		var relVel = A.Velocity.sub(bVel); // Vector2

		var relDot = relVel.dotProduct(info.norm); // float

		//printf("handleCollisions - relVel:[x:%f][y:%f] relDot:%f\n",
		//	   relVel.X, relVel.Y, relDot);
		
		// collision filter!
		//if (!mMaterialPairs[info.bodyA.Material, info.bodyB.Material].CollisionFilter(info.bodyA, info.bodyApm, info.bodyB, info.bodyBpmA, info.bodyBpmB, info.hitPt, relDot))
		//	continue;
		var cf = this.mMaterialPairs[(info.bodyA.getMaterial() * this.mMaterialCount) + info.bodyB.getMaterial()].Callback; // CollisionCallback*
		if (cf)
		{
			if (!cf.collisionFilter(info.bodyA, info.bodyApm, info.bodyB, info.bodyBpmA, info.bodyBpmB, info.hitPt, relDot))
				continue;
		}

		if (info.penetration > 10.0)//this.mPenetrationThreshold)
		{
			//Console.WriteLine("penetration above Penetration Threshold!!  penetration={0}  threshold={1} difference={2}",
			//    info.penetration, mPenetrationThreshold, info.penetration-mPenetrationThreshold);
			//printf("handleCollisions - penetration above threshold! threshold:%f penetration:%f diff:%f\n",
			//	   mPenetrationThreshold, info.penetration, info.penetration - mPenetrationThreshold);
			
			this.mPenetrationCount++;
			continue;
		}

		var b1inf = 1.0 - info.edgeD; // float
		var b2inf = info.edgeD; // float
		
		var b2MassSum = ((B1.Mass == 0.0) || (B2.Mass == 0.0)) ? 0.0 : (B1.Mass + B2.Mass); // float
		
		var massSum = A.Mass + b2MassSum; // float
		
		var Amove; // float
		var Bmove; // float
		if (A.Mass == 0.0)
		{
			Amove = 0.0;
			Bmove = (info.penetration) + 0.001;
		}
		else if (b2MassSum == 0.0)
		{
			Amove = (info.penetration) + 0.001;
			Bmove = 0.0;
		}
		else
		{
			Amove = (info.penetration * (b2MassSum / massSum));
			Bmove = (info.penetration * (A.Mass / massSum));
		}
		
		var B1move = Bmove * b1inf; // float
		var B2move = Bmove * b2inf; // float
		
		//printf("handleCollisions - Amove:%f B1move:%f B2move:%f\n",
		//	   Amove, B1move, B2move)
		//if(false) {
		if (A.Mass != 0.0)
		{
			A.Position.addSelf(info.norm.mulFloat(Amove));
		}
		
		if (B1.Mass != 0.0)
		{
			B1.Position.subSelf(info.norm.mulFloat(B1move));
		}
		
		if (B2.Mass != 0.0)
		{
			B2.Position.subSelf(info.norm.mulFloat(B2move));
		}
		//}
		var AinvMass = (A.Mass == 0.0) ? 0.0 : 1.0 / A.Mass; // float
		var BinvMass = (b2MassSum == 0.0) ? 0.0 : 1.0 / b2MassSum; // float
		
		var jDenom = AinvMass + BinvMass; // float
		var elas = 1.0 + this.mMaterialPairs[(info.bodyA.getMaterial() * this.mMaterialCount) + info.bodyB.getMaterial()].Elasticity; // float
		var numV = relVel.mulFloat(elas); // Vector2
		
		var jNumerator = numV.dotProduct(info.norm); // float
		jNumerator = -jNumerator;
		
		var j = jNumerator / jDenom; // float
		
		
		var tangent = info.norm.getPerpendicular(); // Vector2
		var friction = this.mMaterialPairs[(info.bodyA.getMaterial() * this.mMaterialCount) + info.bodyB.getMaterial()].Friction; // float
		var fNumerator = relVel.dotProduct(tangent); // float
		fNumerator *= friction;
		var f = fNumerator / jDenom; // float
		
		// adjust velocity if relative velocity is moving toward each other.
		if (relDot <= 0.0001)
		{
			if (A.Mass != 0.0)
			{
				A.Velocity.addSelf((info.norm.mulFloat(j / A.Mass)).sub(tangent.mulFloat(f / A.Mass)));
			}
			
			if (b2MassSum != 0.0)
			{
				B1.Velocity.subSelf((info.norm.mulFloat((j / b2MassSum) * b1inf)).sub(tangent.mulFloat((f / b2MassSum) * b1inf)));
			}
			
			if (b2MassSum != 0.0)
			{
				B2.Velocity.subSelf((info.norm.mulFloat((j / b2MassSum) * b2inf)).sub(tangent.mulFloat((f / b2MassSum) * b2inf)));
			}
		}
	}
}

/*
World.prototype._handleCollisions = function() {
	//printf("handleCollisions - count %d\n", mCollisionList.size());
	
	// handle all collisions!
	for (var i = 0; i < this.mCollisionList.length; i++)
	{
		var info = this.mCollisionList[i]; // BodyCollisionInfo

		var A = info.bodyA.getPointMass(info.bodyApm); // PointMass*
		var B1 = info.bodyB.getPointMass(info.bodyBpmA); // PointMass*
		var B2 = info.bodyB.getPointMass(info.bodyBpmB); // PointMass*

		// velocity changes as a result of collision.
		var bVel = (B1.Velocity.add(B2.Velocity)) * 0.5; // Vector2
		var relVel = A.Velocity.sub(bVel); // Vector2

		var relDot = relVel.dotProduct(info.norm); // float

		//printf("handleCollisions - relVel:[x:%f][y:%f] relDot:%f\n",
		//	   relVel.X, relVel.Y, relDot);
		
		// collision filter!
		//if (!mMaterialPairs[info.bodyA.Material, info.bodyB.Material].CollisionFilter(info.bodyA, info.bodyApm, info.bodyB, info.bodyBpmA, info.bodyBpmB, info.hitPt, relDot))
		//	continue;
		var cf = this.mMaterialPairs[(info.bodyA.getMaterial() * this.mMaterialCount) + info.bodyB.getMaterial()].Callback; // CollisionCallback*
		if (cf)
		{
			if (!cf.collisionFilter(info.bodyA, info.bodyApm, info.bodyB, info.bodyBpmA, info.bodyBpmB, info.hitPt, relDot))
				continue;
		}

		if (info.penetration > 10.0)//this.mPenetrationThreshold)
		{
			//Console.WriteLine("penetration above Penetration Threshold!!  penetration={0}  threshold={1} difference={2}",
			//    info.penetration, mPenetrationThreshold, info.penetration-mPenetrationThreshold);
			//printf("handleCollisions - penetration above threshold! threshold:%f penetration:%f diff:%f\n",
			//	   mPenetrationThreshold, info.penetration, info.penetration - mPenetrationThreshold);
			
			this.mPenetrationCount++;
			continue;
		}

		var b1inf = 1.0 - info.edgeD; // float
		var b2inf = info.edgeD; // float
		
		var b2MassSum = ((B1.Mass == 0.0) || (B2.Mass == 0.0)) ? 0.0 : (B1.Mass + B2.Mass); // float
		
		var massSum = A.Mass + b2MassSum; // float
		
		var Amove; // float
		var Bmove; // float
		if (A.Mass == 0.0)
		{
			Amove = 0.0;
			Bmove = (info.penetration) + 0.001;
		}
		else if (b2MassSum == 0.0)
		{
			Amove = (info.penetration) + 0.001;
			Bmove = 0.0;
		}
		else
		{
			Amove = (info.penetration * (b2MassSum / massSum));
			Bmove = (info.penetration * (A.Mass / massSum));
		}
		
		var B1move = Bmove * b1inf; // float
		var B2move = Bmove * b2inf; // float
		
		//printf("handleCollisions - Amove:%f B1move:%f B2move:%f\n",
		//	   Amove, B1move, B2move)
		//if(false) {
		if (A.Mass != 0.0)
		{
			A.Position.addSelf(info.norm.mulFloat(Amove));
		}
		
		if (B1.Mass != 0.0)
		{
			B1.Position.subSelf(info.norm.mulFloat(B1move));
		}
		
		if (B2.Mass != 0.0)
		{
			B2.Position.subSelf(info.norm.mulFloat(B2move));
		}
		//}
		var AinvMass = (A.Mass == 0.0) ? 0.0 : 1.0 / A.Mass; // float
		var BinvMass = (b2MassSum == 0.0) ? 0.0 : 1.0 / b2MassSum; // float
		
		var jDenom = AinvMass + BinvMass; // float
		var elas = 1.0 + this.mMaterialPairs[(info.bodyA.getMaterial() * this.mMaterialCount) + info.bodyB.getMaterial()].Elasticity; // float
		var numV = relVel.mulFloat(elas); // Vector2
		
		var jNumerator = numV.dotProduct(info.norm); // float
		jNumerator = -jNumerator;
		
		var j = jNumerator / jDenom; // float
		
		
		var tangent = info.norm.getPerpendicular(); // Vector2
		var friction = this.mMaterialPairs[(info.bodyA.getMaterial() * this.mMaterialCount) + info.bodyB.getMaterial()].Friction; // float
		var fNumerator = relVel.dotProduct(tangent); // float
		fNumerator *= friction;
		var f = fNumerator / jDenom; // float
		
		// adjust velocity if relative velocity is moving toward each other.
		if (relDot <= 0.0001)
		{
			if (A.Mass != 0.0)
			{
				A.Velocity.addSelf((info.norm.mulFloat(j / A.Mass)).sub(tangent.mulFloat(f / A.Mass)).mulFloat(3.0));
			}
			
			if (b2MassSum != 0.0)
			{
				B1.Velocity.subSelf((info.norm.mulFloat((j / b2MassSum) * b1inf)).sub(tangent.mulFloat((f / b2MassSum) * b1inf)).mulFloat(3.0));
			}
			
			if (b2MassSum != 0.0)
			{
				B2.Velocity.subSelf((info.norm.mulFloat((j / b2MassSum) * b2inf)).sub(tangent.mulFloat((f / b2MassSum) * b2inf)).mulFloat(3.0));
			}
		}
	}
}


*/






	
/*



#ifndef _WORLD_H
#define _WORLD_H

#include "JellyPrerequisites.h"
#include "Vector2.h"
#include "Body.h"


namespace JellyPhysics 
{

	class World 
	{
	public:
		

		
	private:
		
		
	public:
		
		World();
		~World();
		
		void killing();
		
		void setWorldLimits(const Vector2& min, const Vector2& max);
		
		int addMaterial();
		
		void setMaterialPairCollide(int a, int b, bool collide);
		void setMaterialPairData(int a, int b, float friction, float elasticity);
		void setMaterialPairFilterCallback(int a, int b, CollisionCallback* c);
		
		void addBody( Body* b );
		void removeBody( Body* b );
		Body* getBody( int index );
		
		void getClosestPointMass( const Vector2& pt, int& bodyID, int& pmID );
		Body* getBodyContaining( const Vector2& pt );
		
		void update( float elapsed );
		
	private:
		void updateBodyBitmask( Body* b );
		void sortBodyBoundaries();
		
		void _goNarrowCheck( Body* bI, Body* bJ );
		void bodyCollide( Body* bA, Body* bB, std::vector<BodyCollisionInfo>& infoList );
		void _handleCollisions();

		void _checkAndMoveBoundary( Body::BodyBoundary* bb );
		void _removeBoundary( Body::BodyBoundary* me );
		void _addBoundaryAfter( Body::BodyBoundary* me, Body::BodyBoundary* toAfterMe );
		void _addBoundaryBefore( Body::BodyBoundary* me, Body::BodyBoundary* toBeforeMe );
		
		void _logMaterialCollide();
		void _logBoundaries();
		
	public:			
		int getMaterialCount() { return mMaterialCount; }
		
		float getPenetrationThreshold() { return mPenetrationThreshold; }
		void setPenetrationThreshold( float val ) { mPenetrationThreshold = val; }
		
		int getPenetrationCount() { return mPenetrationCount; }
	};
}

#endif	// _WORLD_H








#include "World.h"


namespace JellyPhysics 
{	
	World::~World()
	{
		
		delete[] mMaterialPairs;
	}
										 
	 void World::killing()
	 {
		 // clear up all "VoidMarker" elements in the list...
		 if (mBodies.size() > 0)
		 {
			 Body::BodyBoundary* bb = &mBodies[0]->mBoundStart;
			 
			 while (bb->prev)
				 bb = bb->prev;
			 
			 while (bb)
			 {
				 if (bb->type == Body::BodyBoundary::VoidMarker)
				 {
					 // remove this one!
					 _removeBoundary(bb);
					 Body::BodyBoundary* theNext = bb->next;
					 
					 delete bb;
					 
					 bb = theNext;
					 continue;
				 }
				 
				 bb = bb->next;
			 }
		 }
	 }
		

	
	int World::addMaterial()
	{
		MaterialPair* old = new MaterialPair[mMaterialCount * mMaterialCount];
		for (int i = 0; i < mMaterialCount; i++)
		{
			for (int j = 0; j < mMaterialCount; j++)
			{
				old[(i*mMaterialCount)+j] = mMaterialPairs[(i*mMaterialCount)+j];
			}
		}
		
		mMaterialCount++;
		
		delete[] mMaterialPairs;
		mMaterialPairs = new MaterialPair[mMaterialCount * mMaterialCount];
		
		for (int i = 0; i < mMaterialCount; i++)
		{
			for (int j = 0; j < mMaterialCount; j++)
			{
				if ((i < (mMaterialCount-1)) && (j < (mMaterialCount-1)))
					mMaterialPairs[(i*mMaterialCount)+j] = old[(i*(mMaterialCount-1))+j];
				else
					mMaterialPairs[(i*mMaterialCount)+j] = mDefaultMatPair;
			}
		}
		
#ifdef _DEBUG
		printf("addMaterial - final results...\n");
		_logMaterialCollide();
#endif
		
		return mMaterialCount - 1;
	}
	
	void World::setMaterialPairCollide(int a, int b, bool collide)
	{
#ifdef _DEBUG
		printf("setMaterialPairCollide: %d vs %d %s\n", a, b, (collide ? "ON" : "OFF"));
#endif
		
		if ((a >= 0) && (a < mMaterialCount) && (b >= 0) && (b < mMaterialCount))
		{
			mMaterialPairs[(a*mMaterialCount)+b].Collide = collide;
			mMaterialPairs[(b*mMaterialCount)+a].Collide = collide;
		}

#ifdef _DEBUG
		_logMaterialCollide();
#endif
		
	}
	
	void World::setMaterialPairData(int a, int b, float friction, float elasticity)
	{
#ifdef _DEBUG
		printf("setMaterialPairData: %d vs %d : f:%f e:%f\n", a, b, friction, elasticity);
#endif
		
		if ((a >= 0) && (a < mMaterialCount) && (b >= 0) && (b < mMaterialCount))
		{
			mMaterialPairs[(a*mMaterialCount)+b].Friction = friction;
			mMaterialPairs[(b*mMaterialCount)+a].Elasticity = elasticity;
			
			mMaterialPairs[(a*mMaterialCount)+b].Friction = friction;
			mMaterialPairs[(b*mMaterialCount)+a].Elasticity = elasticity;
		}
		
#ifdef _DEBUG
		_logMaterialCollide();
#endif
	}
	
	
	void World::setMaterialPairFilterCallback(int a, int b, CollisionCallback* c)
	{
		if ((a >= 0) && (a < mMaterialCount) && (b >= 0) && (b < mMaterialCount))
		{
			mMaterialPairs[(a*mMaterialCount)+b].Callback = c;
			mMaterialPairs[(b*mMaterialCount)+a].Callback = c;
		}
	}
	
	void World::removeBody( Body* b )
	{
#ifdef _DEBUG
		printf("removeBody: %d\n", b);
#endif
		
		std::vector<Body*>::iterator it = mBodies.begin();
		while (it != mBodies.end())
		{
			if ((*it) == b)
			{
				mBodies.erase( it );
				_removeBoundary(&b->mBoundStart);
				_removeBoundary(&b->mBoundEnd);
				
#ifdef _DEBUG
				_logBoundaries();
#endif
				
				break;
			}
			
			it++;
		}
	}
	
	Body* World::getBody( int index )
	{
		if ((index >= 0) && (index < mBodies.size()))
			return mBodies[index];
		
		return 0;
	}
	
	
	void World::getClosestPointMass( const Vector2& pt, int& bodyID, int& pmID )
	{
		bodyID = -1;
		pmID = -1;
		
		float closestD = 1000.0f;
		for (unsigned int i = 0; i < mBodies.size(); i++)
		{
			float dist = 0.0f;
			int pm = mBodies[i]->getClosestPointMass(pt, dist);
			if (dist < closestD)
			{
				closestD = dist;
				bodyID = i;
				pmID = pm;
			}
		}
	}
	
	Body* World::getBodyContaining( const Vector2& pt )
	{
		for (unsigned int i = 0; i < mBodies.size(); i++)
		{
			if (mBodies[i]->contains(pt))
				return mBodies[i];
		}
		
		return 0;
	}	
	

	

	
	
	

				
				
	
	

	

	
	

	
	void World::_logMaterialCollide()
	{
		for (int i = 0; i < mMaterialCount; i++)
		{
			if (i == 0)
				printf("[ ][%d]", i);
			else
				printf("[%d]", i);
		}
		printf("\n");
		
		for (int i = 0; i < mMaterialCount; i++)
		{
			printf("[%d]",i);
			
			for (int j = 0; j < mMaterialCount; j++)
			{
				printf("[%s]", (mMaterialPairs[(i*mMaterialCount)+j].Collide ? "X" : " "));
			}
			printf("\n");
		}
		printf("\n");
	}
	
}

*/