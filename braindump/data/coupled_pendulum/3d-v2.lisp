;;;; 3d.lisp
(ql:quickload :lispbuilder-sdl)
(defpackage #:3d
  (:use #:cl #:lispbuilder-sdl)
  (:export #:process-coordinate))


(in-package :3d)

(defun matrix-product (m1 m2)
  (destructuring-bind ((a b) (c d)) (list (array-dimensions m1)
                                          (array-dimensions m2))
    (if (not  (= b c))
        (error "Matrix dimensions don't match for multiplication"))

    (let ((ans (make-array (list a d))))
      (loop for i from  1 to a do
           (loop for j from 1 to d do
                (setf (aref ans (1- i) (1- j))
                      (loop for x from 1 to b
                         summing (* (aref m1 (1- i) (1- x))
                                    (aref m2 (1- x) (1- j)))))))
      ans)))

;;; "3d" goes here. Hacks and glory await!

(defparameter *identity* #2A((1 0 0) (0 1 0) (0 0 1)))
(defparameter *rotation* *identity*)
(defparameter *scaling* #2A((10 0 0) (0 10 0) (0 0 10)))
(defparameter *translation* #(600 -250 0))
(defparameter *rotation-angles* #(-1.3 0 -0.35))
(defparameter *perspective?* nil)
(defparameter *dilation-constant* 1.001)

(defparameter *edges* `(;; Cuboid
                        (#(0 0 0) #(1 0 0))
                        (#(0 0 0) #(0 0 1))
                        (#(0 0 0) #(0 5 0))
                        (#(1 0 0) #(1 0 1))
                        (#(1 0 0) #(1 5 0))
                        (#(0 0 1) #(0 5 1))
                        (#(0 0 1) #(1 0 1))
                        (#(1 0 1) #(1 5 1))
                        (#(1 5 0) #(0 5 0))
                        (#(1 5 0) #(1 5 1))
                        (#(0 5 1) #(1 5 1))
                        (#(0 5 1) #(0 5 0))
                        ;;Axes
                        (#(0 0 0) #(10 0 0) ,*green*)
                        (#(0 0 0) #(0 10 0) ,*blue*)
                        (#(0 0 0) #(0 0 10) ,*red*)
                        ))

(defun scale (k)
  (setf *scaling* (matrix-product (make-array '(3 3) :initial-contents
                                              (list (list k 0 0)
                                                    (list 0 k 0)
                                                    (list 0 0 k)))
                                  *scaling*)))
                                              

(defun apply-perspective-xz (point)
  (let ((x (aref point 0))
        (y (aref point 1))
        (z (aref point 2)))
    (vector (* x (expt *dilation-constant* (- (abs y))))
            (* z (expt *dilation-constant* (- (abs y)))))))
                            
(defun process-coordinate (point)
  "Redurns sdl:point to draw on the screen after transforming the given point"
  (let ((ans (reduce #'matrix-product (list *scaling*
					    *rotation*
					    (make-row-matrix point)))))
    (if *perspective?*
        (setf ans (apply-perspective-xz (row-matrix->point ans)))
        (setf ans (vector (aref ans 0 0) (aref ans 1 0))))
    
    (point :x (+ (aref ans 0) (aref *translation* 0))
           :y (- (+ (aref ans 1) (aref *translation* 1))))))

(defun calculate-matrices ()
  (let ((a1 (aref *rotation-angles* 0))
        (a2 (aref *rotation-angles* 1))
        (a3 (aref *rotation-angles* 2)))
    (let ((mx (make-array '(3 3) :initial-contents
                          (list (list 1    0       0)
                                (list 0 (cos a1)  (- (sin a1)))
                                (list 0 (sin a1)  (cos a1)))))

          (my (make-array '(3 3) :initial-contents
                          (list (list (cos a2)  0  (- (sin a2)))
                                (list     0     1     0)
                                (list (sin a2)  0  (cos a2)))))

          (mz (make-array '(3 3) :initial-contents
                          (list (list (cos a3)  (- (sin a3)) 0)
                                (list (sin a3) (cos a3)  0)
                                (list 0          0        1)))))
      (setf *rotation* (reduce #'matrix-product (list mx my mz))))))

(let ((selection 0) (inc (/ pi 18)))
  (defun key-press-events (key)  
    (case key
      (:sdl-key-q (sdl:push-quit-event))
      (:sdl-key-x (setf selection 0))
      (:sdl-key-y (setf selection 1))
      (:sdl-key-z (setf selection 2))
      (:sdl-key-w (incf (aref *translation* selection) 10))
      (:sdl-key-s (incf (aref *translation* selection) -10))
      (:sdl-key-k (scale 1.2))
      (:sdl-key-l (scale (/ 1 1.2)))                  
      (:sdl-key-p (setf *perspective?* (not *perspective?*))
				  (calculate-matrices))
      (:sdl-key-up (incf (aref *rotation-angles* selection) inc)
				   (calculate-matrices))
      (:sdl-key-down (decf (aref *rotation-angles* selection) inc)
					 (calculate-matrices))
      (:sdl-key-space (setf *rotation-angles* (vector 0 0 0))
					  (calculate-matrices))
	  (:sdl-key-kp5 (setf *rotation-angles* (vector -1.3 0 -0.35))
					(calculate-matrices))
	  (:sdl-key-kp8
	   (setf *rotation-angles* #(0 0 0))
	   (calculate-matrices))
	  (:sdl-key-kp4
	   (setf *rotation-angles* (vector (/ pi -2) 0 (/ pi -2)))
	   (calculate-matrices))
	  (:sdl-key-kp2
	   (setf *rotation-angles* (vector (/ pi -2) 0 0))
	   (calculate-matrices))
	  (t (print key))
	  )))

(defun draw-axes ()
  "Draws X(red),Y(green)&Z(blue) axes on the screen"
  (loop with origin = (process-coordinate #(0 0 0))
     for axis in (list #(100 0 0) #(0 100 0) #(0 0 100))
     for color in (list *red* *green*  *blue*) do
       (draw-line origin (process-coordinate axis) :color color)))
                       


(defun main-loop (&key update-function drawing-function keypress-function)
  (with-init ()
    (sdl:window 800 800 :title-caption "3d" :flags '(sdl-resizable))
    (sdl:initialise-default-font)
    (setf sdl:*default-color* sdl:*black*)
    (enable-key-repeat 25 2)
    (calculate-matrices)
      (sdl:with-events ()      
        (:quit-event () t)
        (:key-down-event
         (:key key)
         (key-press-events key)
	 (when keypress-function 
	   (funcall keypress-function key)))
        (:idle ()
               (clear-display *white*)
               
               (when (mouse-left-p)
                 (print (list (mouse-x) (mouse-y)))
                 (draw-line #(1 1) (point :x (mouse-x) :y (mouse-y)) :color *black*))
	       (when update-function
		 (funcall update-function))

               (loop for edge in *edges*
                  for l1 = (process-coordinate (first edge))
                  for l2 = (process-coordinate (second edge)) do
                    (draw-line l1 l2 :color (or (third edge) *black*)))
               
               (when drawing-function 
		 (funcall drawing-function))

               (update-display)))))


