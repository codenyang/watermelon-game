"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import styles from "./suika.module.scss";

const Suika = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Events = Matter.Events;
    const Runner = Matter.Runner;
    const Composite = Matter.Composite;

    // Matter.js 엔진 생성
    const engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 1;
    // runner create
    const runner = Runner.create();
    // 렌더러 생성
    const render = Render.create({
      canvas: canvasRef.current as HTMLCanvasElement,
      engine: engine,
      options: {
        wireframes: false,
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });

    const watermelons: Matter.Body[] = [];
    const lemons: Matter.Body[] = [];
    const podos: Matter.Body[] = [];

    // 게임 월드 생성
    const world = engine.world;

    // 게임 벽 객체 생성
    const wallLeft = Bodies.rectangle(0, 0, 10, window.innerHeight * 2, {
      isStatic: true,
      label: "wallLeft",
      render: {
        fillStyle: "#00ffff",
      },
      isSleeping: true,
    });
    const wallRight = Bodies.rectangle(
      window.innerWidth,
      0,
      10,
      window.innerHeight * 2,
      {
        isStatic: true,
        label: "wallRight",
        render: {
          fillStyle: "#00ffff",
        },
        isSleeping: true,
      },
    );
    const wallBottom = Bodies.rectangle(
      0,
      window.innerHeight,
      window.innerWidth * 2,
      50,
      {
        isStatic: true,
        label: "wallBottom",
        render: {
          fillStyle: "#00ffff",
        },
        isSleeping: true,
      },
    );

    const addWatermelon = (x: number, y: number) => {
      const watermelon = Bodies.circle(x, y, 20, {
        restitution: 0.5,
        mass: 1,
        label: "watermelon" + watermelons.length,
        render: {
          sprite: {
            texture: "./suika.webp",
            xScale: (20 * 2) / 100,
            yScale: (20 * 2) / 100,
          },
        },
      });
      World.add(world, watermelon);
      watermelons.push(watermelon);
    };

    const addLemon = (x: number, y: number) => {
      const lemon = Bodies.circle(x, y, 25, {
        restitution: 0.5,
        mass: 2,
        label: "lemon" + lemons.length,
        render: {
          sprite: {
            texture: "./lemon.png",
            xScale: (25 * 2) / 100,
            yScale: (25 * 2) / 100,
          },
        },
      });
      World.add(world, lemon);
      lemons.push(lemon);
    };

    const addPodo = (x: number, y: number) => {
      const grapeVertices = [
        { x: 60, y: 0 },
        { x: 115, y: 22 },
        { x: 112, y: 45 },
        { x: 98, y: 67 },
        { x: 93, y: 108 },
        { x: 2, y: 119 },
        { x: 13, y: 34 },
        { x: 53, y: 22 },
        { x: 58, y: 2 },
      ];
      const podo = Bodies.fromVertices(x, y, [grapeVertices], {
        restitution: 0.5,
        mass: 20,
        label: "podo" + podos.length,
        render: {
          sprite: {
            texture: "grape.png",
            xScale: (60 * 2) / 100,
            yScale: (60 * 2) / 100,
          },
        },
      });
      World.add(world, podo);
      podos.push(podo);
    };

    canvasRef.current?.addEventListener("click", (e) => {
      const bound = canvasRef.current?.getBoundingClientRect();
      const mouseX = e.clientX - (bound?.left || 0);
      const mouseY = 100; // e.clientY - (bound?.top || 0);

      const random = Math.floor(Math.random() * 3);

      switch (random) {
        case 0:
          addWatermelon(mouseX, mouseY);
          break;
        case 1:
          addLemon(mouseX, mouseY);
          break;
        case 2:
          addPodo(mouseX, mouseY);
          break;
      }
    });

    const convertToLemon = (watermelons: Matter.Body[]) => {
      if (watermelons.length >= 2) {
        const s1 = watermelons.indexOf(watermelons[0]);
        const s2 = watermelons.indexOf(watermelons[1]);
        // 두 수박의 위치를 가져옵니다.
        const positionA = watermelons[s1].position;
        const positionB = watermelons[s2].position;

        // 두 수박을 제거합니다.
        Composite.remove(world, [watermelons[0], watermelons[1]]);

        // 두 수박 사이의 중간 지점을 계산합니다.
        const centerX = (positionA.x + positionB.x) / 2;
        const centerY = (positionA.y + positionB.y) / 2;

        // 레몬을 월드에 추가합니다.
        addLemon(centerX, centerY);
      }
    };

    const convertToPodo = (lemons: Matter.Body[]) => {
      if (lemons.length >= 2) {
        const s1 = lemons.indexOf(lemons[0]);
        const s2 = lemons.indexOf(lemons[1]);
        // 두 레몬의 위치를 가져옵니다.
        const positionA = lemons[s1].position;
        const positionB = lemons[s2].position;

        // 두 레몬을 제거합니다.
        Composite.remove(world, [lemons[0], lemons[1]]);

        // 두 레몬 사이의 중간 지점을 계산합니다.
        const centerX = (positionA.x + positionB.x) / 2;
        const centerY = (positionA.y + positionB.y) / 2;

        // 포도를 월드에 추가합니다.
        addPodo(centerX, centerY);
      }
    };

    Events.on(engine, "collisionStart", (event) => {
      const collidingWatermelons: Matter.Body[] = [];
      const collidingLemons: Matter.Body[] = [];
      event.pairs.forEach((pair) => {
        if (
          watermelons.includes(pair.bodyA) &&
          watermelons.includes(pair.bodyB)
        ) {
          collidingWatermelons.push(pair.bodyA, pair.bodyB);
        } else if (lemons.includes(pair.bodyA) && lemons.includes(pair.bodyB)) {
          collidingLemons.push(pair.bodyA, pair.bodyB);
        }
      });
      if (collidingWatermelons.length >= 2) {
        // 두 개의 레몬이 충돌 했을 때 포도으로 변경
        convertToLemon(collidingWatermelons);
      } else if (collidingLemons.length >= 2) {
        convertToPodo(collidingLemons);
      }
    });

    // 월드에 객체 추가
    World.add(world, [wallLeft, wallRight, wallBottom]);
    // runner
    Runner.run(runner, engine);
    // 렌더러 실행
    Render.run(render);
  }, []);

  return <canvas className={styles["suika"]} ref={canvasRef} />;
};

export default Suika;
