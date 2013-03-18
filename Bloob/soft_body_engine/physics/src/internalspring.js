var InternalSpring = function(pmA, pmB, d, k, damp) {
	this.pointMassA = pmA || 0;
	this.pointMassB = pmB || 0;
	this.springD = d || 0.0;
	this.springK = k || 0.0;
	this.damping = damp || 0.0;
};
