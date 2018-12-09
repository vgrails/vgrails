# generate the skeleton project structure 

ROOT_DIR=`pwd`

APP='app-demo'
PLUGINS='vgrails-plugin'

cd $ROOT_DIR
mkdir -p ./$APP/
cd ./$APP/
grails create-app --profile web --inplace
grails install-templates

for p in $PLUGINS;
do
	cd $ROOT_DIR
	mkdir -p ./$p
	cd ./$p
	
	grails create-app --profile web-plugin --inplace
	rm -rf gradle*
	rm grailsw*
	rm grails-wrapper.jar
	rm .gitignore
done


cd $ROOT_DIR

mv $APP/gradlew .
mv $APP/gradlew.bat .
mv $APP/gradle.properties .
mv $APP/gradle .

rm $APP/grailsw*
rm $APP/grails-wrapper.jar

echo "include '$APP'" >> settings.gradle

for p in $PLUGINS;
do
	echo "include '$p'" >> settings.gradle
done

echo " " >> $APP/build.gradle

for p in $PLUGINS;
do
	echo "grails { plugins { compile project(':$p')}}" >> $APP/build.gradle
done

gradle bootRun
