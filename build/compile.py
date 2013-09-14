INPUT_DIRECTORY = "../physics/"

INPUT_FILES = [
	
	"jellyphysics.js",
	
	"queue.js",
	
	"bitmask.js",
	
	"internalspring.js",
	
	"jellyprerequisites.js",
	"vector2.js",
	"pointmass.js",
	"aabb.js",
	"vectortools.js",
	"closedshape.js",
	
	"body.js",
	"bodycollisioninfo.js",
	"materialmanager.js",
	"world.js",
	"springbody.js",
	"pressurebody.js",
	
	"ray.js",
	
	"bodybuilder.js",
	"bodyblueprint.js",
	"bodyfactory.js",
	"particle.js",
	"particlecannon.js",
	
	#joints
	"joints/distancejoint.js",
	"joints/pinjoint.js",
	"joints/interpolationjoint.js",
	
	"springbuilder.js",
	
	"contactmanager.js",
	
	"quadtree.js",
	
	"actionfield.js"
]

WRAPPER_FILE = "wrap.js"
REPLACE_TEXT = "// CODE HERE"

TARGET_DIRECTORY = "../"
TARGET_FILE = "jello.js"

OUTPUT = ""

def main():
        global OUTPUT
        with open(WRAPPER_FILE, "r") as wrapper:
                OUTPUT += wrapper.read()
        for inputFile in INPUT_FILES:
                with open(INPUT_DIRECTORY + inputFile, "r") as input:
                        OUTPUT = OUTPUT.replace(REPLACE_TEXT, input.read() + REPLACE_TEXT)
        OUTPUT = OUTPUT.replace(REPLACE_TEXT, "")
        with open(TARGET_DIRECTORY + TARGET_FILE, "w") as target:
                target.write(OUTPUT)

if __name__ == "__main__":
        main()
