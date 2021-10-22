<template>
  <div class="viewer">
    <h1>This is the viewer page</h1>
    <button class="init" @click="init()">Init Threejs</button>
    <button class="compute" @click="compute()">Compute</button>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";

export default {
  name: "Viewer",
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      definition: null,
      grasshopper_file: null,
      doc: null
    };
  },
  async mounted() {
    console.log("rhino3dm:", this.$rhino, "rhino.compute:", this.$RhinoCompute);
    // set rhino compute url and api key
    this.setRhinoCompute();

    // source a grasshopper .gh file or a .ghx in the same directory
    var def_name = "@/assets/grasshopper/worm.gh";
    this.grasshopper_file = def_name;

    let url = this.grasshopper_file;
    let res = await fetch(url);
    console.log("res:0", res);
    let buffer = await res.arrayBuffer();
    this.definition = new Uint8Array(buffer);

    // // initiate threejs
    // this.init();
    // // initiate rhino compute
    // this.compute();
  },
  methods: {
    setRhinoCompute() {
      this.$RhinoCompute.url = "http://localhost:8081/";
      this.$RhinoCompute.apiKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwIjoiUEtDUyM3IiwiYyI6IkFFU18yNTZfQ0JDIiwiYjY0aXYiOiJqMGEzdmVLNFhPeGZhSmw3RGFjeTR3PT0iLCJiNjRjdCI6IjcyVGRIL2NsaWZIWnVEQk9OSUsrNTc5enUzMERhdTRpZzRBYzBBYmord0M2YnM5SmtqVVhicnRtMHRYN3ByUWk2eDJvdUFxb0JiVkhsSE84MWZtL3k3Z2dQd2R0U21wTHgxT295cEo0Q3N5RlhTbS9PbFhwbXRZaEg2dW5rUndwUUhoM0l2cjhJME1tOVdWQkFQTzlLcC94UndoZ1Uxbzg4VkNYZitOcThnNlBhekV4K25va3QrT1dUbGJMU3NubSt0WVg1OHJ6dWhaSFo0U0QxeUsxVkE9PSIsImlhdCI6MTYzNDE2NDAxMH0.G3AeLj3Gk_k-dgbqotcpTA9-HYuKXjvszGI4G-nhORM";
    },

    async compute() {
      // create a rhino point list
      const crvPoints = new this.$rhino.Point3dList();
      crvPoints.add(0, 0, 0);
      crvPoints.add(10, 10, 0);
      crvPoints.add(20, -10, 0);
      crvPoints.add(30, 10, 20);
      crvPoints.add(40, -10, -20);
      crvPoints.add(50, 0, 0);

      // draw curve with the points
      const nCrv = this.$rhino.NurbsCurve.create(false, 3, crvPoints);

      // encode curve
      const crvData = JSON.stringify(nCrv.encode());
      console.log(crvData);

      // instantiate a new data tree input for grasshopper
      const param1 = new this.$RhinoCompute.Grasshopper.DataTree("curve");
      // add the crvData encoded to the crv input tree
      param1.append([0], [crvData]);

      console.log("param1:", param1);
      // clear values
      let trees = [];
      trees.push(param1);

      // Call RhinoCompute

      const res = this.$RhinoCompute.Grasshopper.evaluateDefinition(
        this.grasshopper_file,
        trees
      );

      console.log("grasshopper res:", res);
      // this.collectResults(res);
    },

    // Parse response
    collectResults(responseJson) {
      const values = responseJson.values;
      console.log("values response:", values);
      // clear doc
      if (this.doc !== undefined) this.doc.delete();

      //console.log(values)
      this.doc = new this.$rhino.File3dm();

      // // for each output (RH_OUT:*)...
      // for (let i = 0; i < values.length; i++) {
      //   // ...iterate through data tree structure...
      //   for (const path in values[i].InnerTree) {
      //     const branch = values[i].InnerTree[path];
      //     // ...and for each branch...
      //     for (let j = 0; j < branch.length; j++) {
      //       // ...load rhino geometry into doc
      //       const rhinoObject = this.decodeItem(branch[j]);
      //       if (rhinoObject !== null) {
      //         this.doc.objects().add(rhinoObject, null);
      //       }
      //     }
      //   }
      // }

      // if (this.doc.objects().count < 1) {
      //   console.error("No rhino objects to load!");
      //   this.showSpinner(false);
      //   return;
      // }

      // // set up loader for converting the results to threejs
      // const loader = new Rhino3dmLoader();
      // // loader.setLibraryPath(
      // //   "https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/"
      // // );
      // const resMaterial = new THREE.MeshBasicMaterial({
      //   vertexColors: true,
      //   wireframe: true
      // });

      // // load rhino doc into three.js scene
      // const buffer = new Uint8Array(this.doc.toByteArray()).buffer;
      // loader.parse(buffer, function (object) {
      //   // add material to resulting meshes
      //   object.traverse(child => {
      //     child.material = resMaterial;
      //   });

      //   // add object graph from rhino model to three.js scene
      //   this.scene.add(object);

      //   // hide spinner
      //   this.showSpinner(false);
      // });
    },

    // Shows or hides the loading spinner
    // showSpinner(enable) {
    //   if (enable) document.getElementById("loader").style.display = "block";
    //   else document.getElementById("loader").style.display = "none";
    // },

    // Attempt to decode data tree item to rhino geometry
    decodeItem(item) {
      const data = JSON.parse(item.data);
      if (item.type === "System.String") {
        console.log(item.type);
        try {
          return this.$rhino.DracoCompression.decompressBase64String(data);
        } catch (err) {
          console.log(err);
        } // ignore errors (maybe the string was just a string...)
      } else if (typeof data === "object") {
        return this.$rhino.CommonObject.decode(data);
      }
      return null;
    },

    init() {
      // Rhino models are z-up, so set this as the default
      THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(1, 1, 1);
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      this.camera.position.x = 100;
      this.camera.position.y = 50;
      this.camera.position.z = 25;

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
      // add some controls to orbit the camera
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);

      window.addEventListener("resize", this.onWindowResize, false);

      console.log("renderer", this.renderer);
      this.animate();
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.animate();
    }
  }
};
</script>

<style></style>
