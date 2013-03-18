var EdgeInfo = function() {
	this.dir = new Vector2(0.0, 0.0);	// normalized direction vector for this edge.
	this.length = 0;	// length of the edge.
	this.slope = 0.0;	// slope of the line described by this edge.
};

//typedef std::vector<EdgeInfo> EdgeInfoList;
//typedef std::vector<PointMass> PointMassList;

var bodyConstructorWorld = function(w) {
	this.mWorld = w;
	this.mScale = Vector2.One.copy();
	this.mIsStatic = false;
	this.mKinematic = false;

	this.mVelDamping = 0.999;
	this.mObjectTag = 0;

	this.mMaterial = 0;

	this.mPointCount = 0;
	this.mInvPC = 0.0;

	this.mIgnoreMe = false;

	w.addBody( this );
};

var bodyConstructorMassPerPoint = function(w, shape, massPerPoint, position, angleInRadians, scale, kinematic) {
	this.mWorld = w;
	this.mDerivedPos = position;
	this.mDerivedAngle = angleInRadians;
	this.mLastAngle = this.mDerivedAngle;
	this.mScale = scale;
	this.mMaterial = 0;
	this.mPointCount = 0;
	this.mInvPC = 0.0;
	this.mIsStatic = (massPerPoint == 0.0);
	this.mKinematic = kinematic;

	this.mVelDamping = 0.999;
	this.mObjectTag = null;

	this.mIgnoreMe = false;

	this.setShape(shape);
	for(var i = 0; i < this.mPointCount; i++)
		this.mPointMasses[i].Mass = massPerPoint;

	this.updateAABB(0.0, true);
	this.updateEdgeInfo(true);

	w.addBody( this );
};

var bodyConstructorPointMassList = function(w, shape, pointMasses, position, angleInRadians, scale, kinematic) {
	this.mWorld = w;
	this.mDerivedPos = position;
	this.mDerivedAngle = angleInRadians;
	this.mLastAngle = this.mDerivedAngle;
	this.mScale = scale;
	this.mMaterial = 0;
	this.mPointCount = 0;
	this.mInvPC = 0.0;

	this.mIsStatic = false;
	this.mKinematic = kinematic;

	this.mVelDamping = 0.999;
	this.mObjectTag = null;

	this.mIgnoreMe = false;

	this.setShape(shape);
	for (var i = 0; i < this.mPointCount; i++)
		this.mPointMasses[i].Mass = pointMasses[i];

	this.updateAABB(0.0, true);
	this.updateEdgeInfo(true);
	
	w.addBody(this);
};	

var Body = function() {
	// set default values
	this.mWorld = null;
	this.mBaseShape = new ClosedShape();
	this.mGlobalShape = [];
	this.mPointMasses = [];
	this.mEdgeInfo = [];
	this.mScale = new Vector2(0.0, 0.0);
	this.mDerivedPos = new Vector2(0.0, 0.0);
	this.mDerivedVel = new Vector2(0.0, 0.0);
	this.mDerivedAngle = 0.0;
	this.mDerivedOmega = 0.0;
	this.mLastAngle = 0.0;
	this.mAABB = new AABB();
	this.mMaterial = 0;
	this.mIsStatic = false;
	this.mKinematic = false;
	this.mObjectTag = null;
	this.mVelDamping = 0.0;

	this.mPointCount = 0;
	this.mInvPC = 0;

	this.mIgnoreMe = false;

	this.mBitMaskY = new Bitmask();

	// real constructors
	if(typeof arguments[2] === "undefined")
		var ret = bodyConstructorWorld.apply(this, arguments);
	if(arguments[2] instanceof Array)
		var ret = bodyConstructorPointMassList.apply(this, arguments);
	else
		var ret = bodyConstructorMassPerPoint.apply(this, arguments);
		
	return ret;
};

Body.prototype.kill = function() {
	this.mWorld.removeBody(this);
};

Body.prototype.setShape = function(shape) {
	this.mBaseShape = shape;
	
	if (this.mBaseShape.getVertices().length != this.mPointCount)
	{
		this.mPointMasses.length = 0;
		this.mGlobalShape.length = 0;
		this.mEdgeInfo.length = 0;
		
		for(var i = 0; i < shape.getVertices().length; i++)
			this.mGlobalShape.push(new Vector2(0.0, 0.0));
		
		this.mBaseShape.transformVertices(this.mDerivedPos, this.mDerivedAngle, this.mScale, this.mGlobalShape);
		
		for(var i = 0; i < this.mBaseShape.getVertices().length; i++)
			this.mPointMasses.push(new PointMass(0.0, this.mGlobalShape[i])); 
		
		var e = new EdgeInfo();
		e.dir = new Vector2(0.0, 0.0);
		e.length = 0.0;
		
		for(var i = 0; i < this.mBaseShape.getVertices().length; i++)
			this.mEdgeInfo.push(e);
		
		this.mPointCount = this.mPointMasses.length;
		this.mInvPC = 1.0 / this.mPointCount;
	}
	
	this.updateAABB(0.0, true);
	this.updateEdgeInfo(true);
};

Body.prototype.setMassAll = function(mass) {
	for(var i = 0; i < this.mPointCount; i++)
		this.mPointMasses[i].Mass = mass;
	
	if(mass == 0.0)
		mIsStatic = true;
};

Body.prototype.setMassIndividual = function(index, mass) {
	if((index >= 0) && (index < this.mPointCount))
		this.mPointMasses[index].Mass = mass;
};

Body.prototype.setMassFromList = function(masses) {
	if (masses.length == this.mPointCount) {
		for (var i = 0; i < this.mPointCount; i++)
			this.mPointMasses[i].Mass = masses[i];
	};
};

Body.prototype.getMaterial = function() { return this.mMaterial; };
Body.prototype.setMaterial = function(val) { this.mMaterial = val; };

Body.prototype.setPositionAngle = function(pos, angleInRadians, scale ) {
	this.mBaseShape.transformVertices(pos, angleInRadians, scale, this.mGlobalShape);
	for(var i = 0; i < this.mPointCount; i++)
		this.mPointMasses[i].Position = this.mGlobalShape[i];
	
	this.mDerivedPos = pos;
	this.mDerivedAngle = angleInRadians;
};

Body.prototype.setKinematicPosition = function(pos) { this.mDerivedPos = pos; };
Body.prototype.setKinematicAngle = function(angleInRadians) { this.mDerivedAngle = angleInRadians; }
Body.prototype.setKinematicScale = function(scale) { this.mScale = scale; }
		
Body.prototype.derivePositionAndAngle = function(elapsed) {
	// no need if this is a static body, or kinematically controlled.
	if (this.mIsStatic || this.mKinematic)
		return;

	// if we are being ignored, be ignored!
	if (this.mIgnoreMe)
		return;
	
	// find the geometric center.
	var center = new Vector2(0.0, 0.0);
	var vel = new Vector2(0.0, 0.0);
	
	for(var i = 0; i < this.mPointMasses.length; i++)
	{
		center.addSelf(this.mPointMasses[i].Position);
		vel.addSelf(this.mPointMasses[i].Velocity);
	}
	
	center.mulFloatSelf(this.mInvPC);
	vel.mulFloatSelf(this.mInvPC);
	
	this.mDerivedPos = center;
	this.mDerivedVel = vel;
	
	// find the average angle of all of the masses.
	var angle = 0;
	var originalSign = 1;
	var originalAngle = 0;
	for(var i = 0; i < this.mPointCount; i++) {
		var baseNorm = this.mBaseShape.getVertices()[i].copy(); // Vector2
		baseNorm.normalize();
		
		var curNorm = this.mPointMasses[i].Position.sub(this.mDerivedPos); // Vector2
		curNorm.normalize();
		
		var dot = baseNorm.dotProduct(curNorm); // float
		if (dot > 1.0) { dot = 1.0; };
		if (dot < -1.0) { dot = -1.0; };
		
		var thisAngle = Math.acos(dot); // float
		if (!VectorTools.isCCW(baseNorm, curNorm)) { thisAngle = -thisAngle; };
		
		if (i == 0) {
			originalSign = (thisAngle >= 0.0) ? 1 : -1;
			originalAngle = thisAngle;
		} else {
			var diff = (thisAngle - originalAngle); // float
			var thisSign = (thisAngle >= 0.0) ? 1 : -1; // int
			
			if ((absf(diff) > PI) && (thisSign != originalSign)) {
				thisAngle = (thisSign == -1) ? (PI + (PI + thisAngle)) : ((PI - thisAngle) - PI);
			};
		};
		
		angle += thisAngle;
	};
	
	angle *= this.mInvPC;
	this.mDerivedAngle = angle;
	
	// now calculate the derived Omega, based on change in angle over time.
	var angleChange = (this.mDerivedAngle - this.mLastAngle); // float
	if (absf(angleChange) >= PI)
	{
		if (angleChange < 0.0)
			angleChange = angleChange + TWO_PI;
		else
			angleChange = angleChange - TWO_PI;
	}

	this.mDerivedOmega = angleChange / elapsed;

	this.mLastAngle = this.mDerivedAngle;
};

Body.prototype.updateEdgeInfo = function(forceUpdate) { // bool(have to be updated?)
	if(((!this.mIsStatic) && (!this.mIgnoreMe)) || (forceUpdate)) {
		for (var i = 0; i < this.mPointCount; i++) {
			var j = (i < (this.mPointCount-1)) ? i + 1 : 0; // int

			var e = this.mPointMasses[j].Position.sub(this.mPointMasses[i].Position); // Vector2
			this.mEdgeInfo[i].length = e.normalize();
			this.mEdgeInfo[i].dir = e;
			// TODO: maybe here is a bug: if y is nearly zero slope should be infinite
			this.mEdgeInfo[i].slope = (absf(e.y) < 1.0e-08) ? 0.0 : (e.x / e.y);
		};
	};
};

Body.prototype.getDerivedPosition = function() { return this.mDerivedPos; };
Body.prototype.getDerivedAngle = function() { return this.mDerivedAngle; };
Body.prototype.getDerivedVelocity = function() { return this.mDerivedVel; };
Body.prototype.getDerivedOmega = function() { return this.mDerivedOmega; };

Body.prototype.getScale = function() { return this.mScale; };

Body.prototype.accumulateInternalForces = function() {};
Body.prototype.accumulateExternalForces = function() {};

Body.prototype.integrate = function(elapsed) { // float
	if (this.mIsStatic || this.mIgnoreMe) { return; };
	
	for(var i = 0; i < this.mPointMasses.length; i++)
		this.mPointMasses[i].integrateForce(elapsed);
};

Body.prototype.dampenVelocity = function() {
	if (this.mIsStatic || this.mIgnoreMe) { return; }

	for(var i = 0; i < this.mPointMasses.length; i++)
		this.mPointMasses[i].Velocity.mulFloatSelf(this.mVelDamping);
}

Body.prototype.updateAABB = function(elapsed, forceUpdate) { // float, bool 
	forceUpdate = forceUpdate || false;
	if (((!this.mIsStatic) && (!this.mIgnoreMe)) || (forceUpdate)) {
		this.mAABB.clear();
		for(var i = 0; i < this.mPointMasses.length; i++) {
			var p = this.mPointMasses[i].Position.copy(); // Vector2
			this.mAABB.expandToInclude(p);
			
			// expanding for velocity only makes sense for dynamic objects.
			if (!this.mIsStatic) {
				p.addSelf(this.mPointMasses[i].Velocity.mulFloat(elapsed));
				this.mAABB.expandToInclude(p);
			};
		};
		
		//printf("Body: %d AABB: min[%f][%f] max[%f][%f]\n", this, mAABB.Min.X, mAABB.Min.Y, mAABB.Max.X, mAABB.Max.Y);
	};
};

Body.prototype.getAABB = function() { return this.mAABB; };

Body.prototype.contains = function(pt) { // Vector2
	// basic idea: draw a line from the point to a point known to be outside the body.  count the number of
	// lines in the polygon it intersects.  if that number is odd, we are inside.  if it's even, we are outside.
	// in this implementation we will always use a line that moves off in the positive X direction from the point
	// to simplify things.
	var endPt = new Vector2(this.mAABB.Max.x + 0.1, pt.y); // Vector2
	
	// line we are testing against goes from pt -> endPt.
	var inside = false; // bool
	var edgeSt = this.mPointMasses[0].Position; // Vector2
	var edgeEnd = new Vector2(0.0, 0.0); // Vector2
	var c = this.mPointCount; // int
	for(var i = 0; i < c; i++) {
		// the current edge is defined as the line from edgeSt -> edgeEnd.
		if(i < (c - 1))
			edgeEnd = this.mPointMasses[i + 1].Position;
		else
			edgeEnd = this.mPointMasses[0].Position;
		
		// perform check now...
		if(((edgeSt.y <= pt.y) && (edgeEnd.y > pt.y)) || ((edgeSt.y > pt.y) && (edgeEnd.y <= pt.y))) {
			// this line crosses the test line at some point... does it do so within our test range?
			var mult = (pt.y - edgeSt.y) / (edgeEnd.y - edgeSt.y);
			var hitX = edgeSt.x + (mult * (edgeEnd.x - edgeSt.x));
			//var slope = this.mEdgeInfo[i].slope; 
			//slope = (edgeEnd.x - edgeSt.x) / (edgeEnd.Y - edgeSt.Y); // float
			
			//var hitX = edgeSt.x + ((pt.y - edgeSt.y) * slope); // float
			
			if((hitX >= pt.x) && (hitX <= endPt.x))
				inside = !inside;
		};
		edgeSt = edgeEnd;
	};
	
	return inside;
};

Body.prototype.getClosestPoint = function(pt, hitPt, norm, pointA, pointB, edgeD) { // Vector2, Vector2, Vector2, int, int, float
	throw Error("TODO: allparameter are designed as out parameter");
	hitPt = new Vector2(0.0, 0.0);
	pointA = -1;
	pointB = -1;
	edgeD = 0.0;
	norm = new Vector2(0.0, 0.0);
	
	var closestD = 1000.0; // float

	for (var i = 0; i < this.mPointCount; i++) {
		var tempHit = new Vector2(0.0, 0.0); // Vector2
		var tempNorm = new Vector2(0.0, 0.0); // Vector2
		var tempEdgeD = 0.0; // float
		
		var dist = this.getClosestPointOnEdge(pt, i, tempHit, tempNorm, tempEdgeD); // float
		if (dist < closestD) {
			closestD = dist;
			pointA = i;
			if (i < (this.mPointCount - 1))
				pointB = i + 1;
			else
				pointB = 0;
			edgeD = tempEdgeD;
			norm = tempNorm;
			hitPt = tempHit;
		}
	}

	return closestD;
};

Body.prototype.getIsStatic = function() { return this.mIsStatic; };
Body.prototype.setIsStatic = function(val) { this.mIsStatic = val; }; // bool

Body.prototype.getIgnoreMe = function() { return this.mIgnoreMe; };
Body.prototype.setIgnoreMe = function(setting) { this.mIgnoreMe = setting; }; // bool

Body.prototype.getClosestPointOnEdgeSquared = function(outParams) {
//outParams = {
//	pt, // const Vector2&
//	edgeNum, // int
//	hitPt, // Vector2&
//	norm, // Vector2&
//	edgeD // float&
//}
//----------------------------------------------
	if(this.aName == "B")
	{
		hallo = 1;
	};
	outParams.hitPt = new Vector2(0.0, 0.0);
	outParams.norm = new Vector2(0.0, 0.0);
	
	outParams.edgeD = 0.0;
	var dist = 0.0; // float
	
	var ptA = this.mPointMasses[outParams.edgeNum].Position; // Vector2
	var ptB; // Vector2
	
	if (outParams.edgeNum < (this.mPointCount - 1))
		ptB = this.mPointMasses[outParams.edgeNum + 1].Position;
	else
		ptB = this.mPointMasses[0].Position;
	
	var toP = outParams.pt.sub(ptA); // Vector2
	var E = this.mEdgeInfo[outParams.edgeNum].dir; // Vector2
	
	// get the length of the edge, and use that to normalize the vector.
	var edgeLength = this.mEdgeInfo[outParams.edgeNum].length; // float
	
	// normal
	var n = E.getPerpendicular(); // Vector2
	
	// calculate the distance!
	var x = toP.dotProduct(E); // float
	if (x <= 0.0)
	{
		// x is outside the line segment, distance is from pt to ptA.
		dist = (outParams.pt.sub(ptA)).lengthSquared();
		//Vector2.DistanceSquared(ref pt, ref ptA, out dist);
		outParams.hitPt = ptA;
		outParams.edgeD = 0.0;
		outParams.norm = n;
		
		//printf("getClosestPointonEdgeSquared - closest is ptA: %f\n", dist);
	}
	else if (x >= edgeLength)
	{
		// x is outside of the line segment, distance is from pt to ptB.
		dist = (outParams.pt.sub(ptB)).lengthSquared();
		//Vector2.DistanceSquared(ref pt, ref ptB, out dist);
		outParams.hitPt = ptB;
		outParams.edgeD = 1.0;
		outParams.norm = n;
		
		//printf("getClosestPointonEdgeSquared - closest is ptB: %f\n", dist);
	}
	else
	{
		// point lies somewhere on the line segment.			
		dist = toP.crossProduct(E);
		//Vector3.Cross(ref toP3, ref E3, out E3);
		dist = (dist * dist);
		outParams.hitPt = ptA.add(E.mulFloat(x));
		outParams.edgeD = x / edgeLength;
		outParams.norm = n;
		
		//printf("getClosestPointonEdgeSquared - closest is at %f: %f\n", edgeD, dist);
	}
	
	return dist;
}

Body.prototype.getPointMassCount = function() { return this.mPointCount; };
Body.prototype.getPointMass = function(index) { return this.mPointMasses[index]; } // int index, returns PointMass* 

Body.prototype.addGlobalForce = function(pt, force) { //  const Vector2&,  const Vector2&
	var R = this.mDerivedPos.sub(pt); // Vector2

	var torqueF = R.crossProduct(force); // float
	
	for (var i = 0; i < this.mPointMasses.length; i++)
	{
		var massPoint = this.mPointMasses[i];
		var toPt = massPoint.Position.sub(this.mDerivedPos); // Vector2
		var torque = VectorTools.rotateVector(toPt, -HALF_PI); // Vector2
		
		massPoint.Force.addSelf(torque.mulFloat(torqueF));
		massPoint.Force.addSelf(force);
	}
};

Body.prototype.getVelocityDamping = function() { return this.mVelDamping; }; // returns float
Body.prototype.setVelocityDamping = function(val) { this.mVelDamping = val; }; // float


/*	
		float getClosestPointOnEdge( const Vector2& pt, int edgeNum, Vector2& hitPt, Vector2& norm, float& edgeD );
		int getClosestPointMass( const Vector2& pos, float& dist );
		
		
		bool getIsKinematic() { return mKinematic; }
		void setIsKinematic( bool val ) { mKinematic = val; }
		
		
		void* getObjectTag() { return mObjectTag; }
		void setObjectTag( void* obj ) { mObjectTag = obj; }
		
		
	};
}



#include "Body.h"
#include "World.h"

#include "VectorTools.h"

namespace JellyPhysics 
{
	

	
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------

	
	//--------------------------------------------------------------------
	float Body::getClosestPointOnEdge( const Vector2& pt, int edgeNum, Vector2& hitPt, Vector2& norm, float& edgeD )
	{
		hitPt = Vector2::Zero;
		norm = Vector2::Zero;
		
		edgeD = 0.0f;
		float dist = 0.0f;
		
		Vector2 ptA = mPointMasses[edgeNum].Position;
		Vector2 ptB;
		
		if (edgeNum < (mPointCount - 1))
			ptB = mPointMasses[edgeNum + 1].Position;
		else
			ptB = mPointMasses[0].Position;
		
		Vector2 toP = pt - ptA;		
		Vector2 E = mEdgeInfo[edgeNum].dir;

		// get the length of the edge, and use that to normalize the vector.
		float edgeLength = mEdgeInfo[edgeNum].length;
		
		// normal
		Vector2 n = E.getPerpendicular();
		
		// calculate the distance!
		float x = toP.dotProduct(E);
		
		if (x <= 0.0f)
		{
			// x is outside the line segment, distance is from pt to ptA.
			dist = (pt - ptA).length();
			hitPt = ptA;
			edgeD = 0.0f;
			norm = n;
		}
		else if (x >= edgeLength)
		{
			// x is outside of the line segment, distance is from pt to ptB.
			dist = (pt - ptB).length();
			hitPt = ptB;
			edgeD = 1.0f;
			norm = n;
		}
		else
		{
			// point lies somewhere on the line segment.			
			dist = absf(toP.crossProduct(E));
			hitPt = ptA + (E * x);
			edgeD = x / edgeLength;
			norm = n;
		}
		
		return dist;
	}
	
	//--------------------------------------------------------------------
	
	//--------------------------------------------------------------------
	int Body::getClosestPointMass( const Vector2& pos, float& dist )
	{
		float closestSQD = 100000.0f;
		int closest = -1;
		
		for (int i = 0; i < mPointCount; i++)
		{
			float thisD = (pos - mPointMasses[i].Position).lengthSquared();
			if (thisD < closestSQD)
			{
				closestSQD = thisD;
				closest = i;
			}
		}
		
		dist = (float)sqrt(closestSQD);
		return closest;
	}
}

*/